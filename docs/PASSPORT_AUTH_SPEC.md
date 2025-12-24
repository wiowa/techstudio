# Spécification d'Implémentation - Authentification Passport.js pour @apps/api

**Date**: 2025-01-16
**Projet**: Wiowa Tech Studio - Monorepo Nx
**Portée**: API NestJS avec authentification complète

---

## 📋 Vue d'Ensemble

### Objectif
Implémenter un système d'authentification complet avec Passport.js dans l'API NestJS existante, incluant:
- Authentification JWT + Local Strategy
- Gestion complète des utilisateurs (CRUD)
- Email verification
- Password reset/recovery
- RBAC (Role-Based Access Control)
- Token rotation pour sécurité maximale

### Stack Technique Sélectionnée
- **Framework**: NestJS 11.x
- **Authentification**: Passport.js (@nestjs/passport, @nestjs/jwt)
- **Base de données**: PostgreSQL
- **ORM**: TypeORM (@nestjs/typeorm)
- **Hashing**: bcrypt
- **Email**: Resend
- **Configuration**: @nestjs/config avec validation Joi
- **Logging**: Winston (nestjs-winston)

---

## 🏗️ Architecture des Modules

```
apps/api/src/
├── app/
│   ├── app.module.ts         # Module principal (existant)
│   ├── app.controller.ts
│   └── app.service.ts
├── config/                    # ✨ NOUVEAU
│   ├── config.module.ts
│   ├── database.config.ts
│   ├── jwt.config.ts
│   └── validation.schema.ts
├── database/                  # ✨ NOUVEAU
│   ├── database.module.ts
│   └── migrations/
├── auth/                      # ✨ NOUVEAU
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── strategies/
│   │   ├── jwt.strategy.ts
│   │   ├── local.strategy.ts
│   │   └── jwt-refresh.strategy.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   ├── local-auth.guard.ts
│   │   ├── roles.guard.ts
│   │   └── jwt-refresh.guard.ts
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   ├── roles.decorator.ts
│   │   └── public.decorator.ts
│   ├── dto/
│   │   ├── login.dto.ts
│   │   ├── register.dto.ts
│   │   ├── refresh-token.dto.ts
│   │   ├── forgot-password.dto.ts
│   │   └── reset-password.dto.ts
│   └── entities/
│       └── refresh-token.entity.ts
├── users/                     # ✨ NOUVEAU
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── entities/
│   │   └── user.entity.ts
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   └── update-user.dto.ts
│   └── enums/
│       └── user-role.enum.ts
├── mail/                      # ✨ NOUVEAU
│   ├── mail.module.ts
│   ├── mail.service.ts
│   └── templates/
│       ├── email-verification.template.ts
│       └── password-reset.template.ts
└── common/                    # ✨ NOUVEAU
    ├── filters/
    │   └── http-exception.filter.ts
    ├── interceptors/
    │   └── logging.interceptor.ts
    └── pipes/
        └── validation.pipe.ts
```

---

## 🗄️ Schéma de Base de Données

### Entity: User

```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  emailVerificationToken?: string;

  @Column({ nullable: true })
  emailVerificationExpires?: Date;

  @Column({ nullable: true })
  passwordResetToken?: string;

  @Column({ nullable: true })
  passwordResetExpires?: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastLoginAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => RefreshToken, (token) => token.user)
  refreshTokens: RefreshToken[];
}
```

### Entity: RefreshToken (Token Rotation)

```typescript
@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  token: string;

  @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  expiresAt: Date;

  @Column({ default: false })
  isRevoked: boolean;

  @Column({ nullable: true })
  replacedByToken?: string;

  @Column({ nullable: true })
  revokedAt?: Date;

  @Column()
  createdByIp: string;

  @Column({ nullable: true })
  revokedByIp?: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

### Enum: UserRole

```typescript
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}
```

---

## 🔐 Flux d'Authentification

### 1. Registration Flow

```
Client → POST /api/auth/register
  ↓
Validate DTO (email, password strength)
  ↓
Hash password (bcrypt, 10 rounds)
  ↓
Create User (isEmailVerified: false)
  ↓
Generate email verification token (crypto.randomBytes)
  ↓
Send verification email (Resend)
  ↓
Return { message: "Check email for verification" }
```

### 2. Email Verification Flow

```
Client → GET /api/auth/verify-email?token=xxx
  ↓
Find user by token & check expiry
  ↓
Set isEmailVerified: true
  ↓
Clear verification token
  ↓
Return { message: "Email verified successfully" }
```

### 3. Login Flow (JWT + Refresh Token Rotation)

```
Client → POST /api/auth/login { email, password }
  ↓
LocalStrategy validates credentials
  ↓
Check isEmailVerified === true
  ↓
Check rate limiting (max 5 attempts/15min)
  ↓
Generate Access Token (JWT, 15min expiry)
  ↓
Generate Refresh Token (UUID, 7 days expiry)
  ↓
Store refresh token in DB with IP
  ↓
Update lastLoginAt
  ↓
Return { accessToken, refreshToken, user }
```

### 4. Token Refresh Flow (Rotation)

```
Client → POST /api/auth/refresh { refreshToken }
  ↓
Find refresh token in DB
  ↓
Validate: not expired, not revoked
  ↓
Revoke old refresh token
  ↓
Generate NEW access token (15min)
  ↓
Generate NEW refresh token (7 days)
  ↓
Store new refresh token with replacedByToken reference
  ↓
Return { accessToken, refreshToken }
```

**Sécurité Token Rotation**:
- Si un token déjà utilisé (revoked) est réutilisé → détecte token theft
- Révoque toute la chaîne de tokens de l'utilisateur
- Force re-login complet

### 5. Password Reset Flow

```
Step 1: Request Reset
Client → POST /api/auth/forgot-password { email }
  ↓
Generate reset token (crypto, 1h expiry)
  ↓
Send reset email with link
  ↓
Return { message: "Check email" }

Step 2: Reset Password
Client → POST /api/auth/reset-password { token, newPassword }
  ↓
Validate token & expiry
  ↓
Hash new password
  ↓
Clear reset token
  ↓
Revoke all refresh tokens (force re-login)
  ↓
Return { message: "Password reset successful" }
```

### 6. Logout Flow

```
Client → POST /api/auth/logout { refreshToken }
  ↓
Find refresh token
  ↓
Set isRevoked: true
  ↓
Set revokedAt: now
  ↓
Return { message: "Logged out successfully" }
```

---

## 📦 Dépendances à Installer

```json
{
  "dependencies": {
    "@nestjs/config": "^3.2.0",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.3",
    "@nestjs/typeorm": "^10.0.2",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "passport-local": "^1.0.0",
    "bcrypt": "^5.1.1",
    "typeorm": "^0.3.20",
    "pg": "^8.11.3",
    "joi": "^17.12.2",
    "class-validator": "^0.14.1",
    "class-transformer": "^0.5.1",
    "resend": "^3.2.0",
    "nestjs-winston": "^1.9.4",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "@types/passport-jwt": "^4.0.1",
    "@types/passport-local": "^1.0.38",
    "@types/bcrypt": "^5.0.2"
  }
}
```

---

## ⚙️ Configuration (.env)

```bash
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=wiowa_auth_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_REFRESH_EXPIRATION=7d

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
APP_URL=http://localhost:4200

# Security
BCRYPT_ROUNDS=10
PASSWORD_MIN_LENGTH=8

# Rate Limiting
LOGIN_MAX_ATTEMPTS=5
LOGIN_LOCK_DURATION=900000  # 15 minutes in ms

# App
PORT=3333
NODE_ENV=development
```

### Validation Schema (Joi)

```typescript
import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // Database
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_USERNAME: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),

  // JWT
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRATION: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),

  // Email
  RESEND_API_KEY: Joi.string().required(),
  EMAIL_FROM: Joi.string().email().required(),
  APP_URL: Joi.string().uri().required(),

  // Security
  BCRYPT_ROUNDS: Joi.number().default(10),
  PASSWORD_MIN_LENGTH: Joi.number().default(8),

  // App
  PORT: Joi.number().default(3333),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
});
```

---

## 🛡️ Sécurité

### Password Validation (class-validator)

```typescript
import {
  IsEmail,
  IsString,
  MinLength,
  Matches,
  IsNotEmpty,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain uppercase, lowercase, number and special character',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;
}
```

### Rate Limiting Strategy

Utiliser `@nestjs/throttler` pour limiter les tentatives de login:

```typescript
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 900000, // 15 minutes
      limit: 5,    // 5 attempts
    }]),
  ],
})
```

Appliquer le guard sur `/auth/login`:

```typescript
@UseGuards(ThrottlerGuard)
@Post('login')
async login(@Body() loginDto: LoginDto) {
  // ...
}
```

### CORS Configuration Update

Mettre à jour `main.ts` pour supporter les credentials:

```typescript
app.enableCors({
  origin: ['http://localhost:4200', 'http://localhost:4201'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

---

## 🎯 Endpoints API

### Auth Endpoints

| Method | Endpoint | Description | Auth Required | Body |
|--------|----------|-------------|---------------|------|
| POST | `/api/auth/register` | Créer un compte | Non | `{ email, password, firstName, lastName }` |
| POST | `/api/auth/login` | Se connecter | Non | `{ email, password }` |
| POST | `/api/auth/logout` | Se déconnecter | Oui | `{ refreshToken }` |
| POST | `/api/auth/refresh` | Rafraîchir le token | Non | `{ refreshToken }` |
| GET | `/api/auth/verify-email` | Vérifier email | Non | `?token=xxx` |
| POST | `/api/auth/forgot-password` | Demander reset | Non | `{ email }` |
| POST | `/api/auth/reset-password` | Réinitialiser MDP | Non | `{ token, newPassword }` |
| GET | `/api/auth/me` | Profil utilisateur | Oui | - |

### Users Endpoints (Admin/Self)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/users` | Liste utilisateurs | Oui | Admin |
| GET | `/api/users/:id` | Détails utilisateur | Oui | Admin ou Self |
| PATCH | `/api/users/:id` | Modifier utilisateur | Oui | Admin ou Self |
| DELETE | `/api/users/:id` | Supprimer utilisateur | Oui | Admin |
| PATCH | `/api/users/:id/role` | Changer rôle | Oui | Admin |

---

## 🔑 Utilisation des Guards

### Protéger une route (JWT)

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Get('protected')
getProtectedData() {
  return { message: 'This is protected!' };
}
```

### Protéger par rôle (RBAC)

```typescript
import { Roles } from './auth/decorators/roles.decorator';
import { RolesGuard } from './auth/guards/roles.guard';
import { UserRole } from './users/enums/user-role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Get('admin-only')
getAdminData() {
  return { message: 'Admin access only' };
}
```

### Route publique (sans auth)

```typescript
import { Public } from './auth/decorators/public.decorator';

@Public()
@Get('public')
getPublicData() {
  return { message: 'Public access' };
}
```

### Récupérer l'utilisateur courant

```typescript
import { CurrentUser } from './auth/decorators/current-user.decorator';
import { User } from './users/entities/user.entity';

@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@CurrentUser() user: User) {
  return user;
}
```

---

## 🐳 Docker Compose (PostgreSQL)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: wiowa-postgres
    restart: unless-stopped
    ports:
      - '5432:5432'
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: wiowa_auth_db
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - wiowa-network

  # Optional: PgAdmin for database management
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: wiowa-pgadmin
    restart: unless-stopped
    ports:
      - '5050:80'
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@wiowa.com
      PGADMIN_DEFAULT_PASSWORD: admin
    networks:
      - wiowa-network
    depends_on:
      - postgres

volumes:
  postgres-data:

networks:
  wiowa-network:
    driver: bridge
```

---

## 📧 Templates Email (Resend)

### Verification Email Template

```typescript
export const emailVerificationTemplate = (
  userName: string,
  verificationUrl: string
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Verify Your Email</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #333;">Welcome to Wiowa Tech Studio!</h1>
  <p>Hi ${userName},</p>
  <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
  <a href="${verificationUrl}"
     style="display: inline-block; padding: 12px 24px; background-color: #007bff;
            color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
    Verify Email Address
  </a>
  <p>Or copy and paste this link into your browser:</p>
  <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
  <p>This link will expire in 24 hours.</p>
  <p>If you didn't create this account, please ignore this email.</p>
  <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
  <p style="color: #999; font-size: 12px;">
    Wiowa Tech Studio - Secure Authentication System
  </p>
</body>
</html>
`;
```

### Password Reset Template

```typescript
export const passwordResetTemplate = (
  userName: string,
  resetUrl: string
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #333;">Password Reset Request</h1>
  <p>Hi ${userName},</p>
  <p>We received a request to reset your password. Click the button below to proceed:</p>
  <a href="${resetUrl}"
     style="display: inline-block; padding: 12px 24px; background-color: #dc3545;
            color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
    Reset Password
  </a>
  <p>Or copy and paste this link into your browser:</p>
  <p style="color: #666; word-break: break-all;">${resetUrl}</p>
  <p>This link will expire in 1 hour.</p>
  <p><strong>If you didn't request this, please ignore this email and your password will remain unchanged.</strong></p>
  <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
  <p style="color: #999; font-size: 12px;">
    Wiowa Tech Studio - Secure Authentication System
  </p>
</body>
</html>
`;
```

---

## 🧪 Testing Strategy

### Unit Tests
- **Auth Service**: Registration, login, token generation logic
- **Users Service**: CRUD operations, password hashing
- **Mail Service**: Email sending mocks
- **Guards**: JWT validation, role checks

### Integration Tests
- **Auth Endpoints**: Full registration → verification → login flow
- **Token Rotation**: Refresh flow with database persistence
- **Password Reset**: Complete forgot → reset flow
- **RBAC**: Role-based access control scenarios

### E2E Tests (Recommended)
```bash
# Dans apps/api-e2e (à créer si nécessaire)
npx nx e2e api-e2e
```

---

## 📝 Ordre d'Implémentation Recommandé

### Phase 1: Infrastructure (Jour 1)
1. ✅ Setup PostgreSQL (Docker Compose)
2. ✅ Install dependencies (@nestjs/typeorm, pg, etc.)
3. ✅ Configure @nestjs/config + validation
4. ✅ Create ConfigModule + DatabaseModule
5. ✅ Test database connection

### Phase 2: User Management (Jour 2)
1. ✅ Create User entity + migration
2. ✅ Create UsersModule + service
3. ✅ Implement password hashing (bcrypt)
4. ✅ Create basic CRUD operations
5. ✅ Add UserRole enum

### Phase 3: Basic Auth (Jour 3-4)
1. ✅ Create RefreshToken entity + migration
2. ✅ Setup Passport strategies (Local + JWT)
3. ✅ Implement AuthService (register, login)
4. ✅ Create auth guards + decorators
5. ✅ Implement token rotation logic
6. ✅ Add rate limiting (throttler)

### Phase 4: Email Features (Jour 5)
1. ✅ Setup Resend integration (MailModule)
2. ✅ Create email templates
3. ✅ Implement email verification flow
4. ✅ Implement password reset flow
5. ✅ Test email sending

### Phase 5: RBAC & Security (Jour 6)
1. ✅ Implement RolesGuard
2. ✅ Add @Roles() decorator
3. ✅ Protect admin routes
4. ✅ Add logging (Winston)
5. ✅ Security audit & validation

### Phase 6: Integration & Testing (Jour 7)
1. ✅ Frontend integration (React apps)
2. ✅ Write unit tests
3. ✅ Write E2E tests
4. ✅ Documentation
5. ✅ Production checklist

---

## 🔗 Intégration Frontend (React)

### Axios Instance Configuration

```typescript
// apps/myhost/src/lib/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3333/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor pour ajouter le token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor pour refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(
          'http://localhost:3333/api/auth/refresh',
          { refreshToken }
        );

        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

### Auth Context (React)

```typescript
// apps/myhost/src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/axios';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on mount
    const token = localStorage.getItem('accessToken');
    if (token) {
      api.get('/auth/me')
        .then(({ data }) => setUser(data))
        .catch(() => localStorage.clear())
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      await api.post('/auth/logout', { refreshToken });
    }
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

## ✅ Production Checklist

### Security
- [ ] Utiliser de vrais secrets JWT (pas les exemples)
- [ ] Activer HTTPS en production
- [ ] Configurer CORS strictement (domaines spécifiques)
- [ ] Implémenter rate limiting global (pas seulement login)
- [ ] Activer Helmet.js pour headers sécurisés
- [ ] Scanner les dépendances (npm audit)
- [ ] Utiliser des variables d'environnement sécurisées

### Database
- [ ] Exécuter toutes les migrations
- [ ] Setup backups automatiques
- [ ] Configurer connection pooling
- [ ] Indexer les colonnes fréquemment requêtées (email, tokens)
- [ ] Utiliser SSL pour connection PostgreSQL

### Monitoring & Logging
- [ ] Configurer Winston pour logs production
- [ ] Mettre en place log rotation
- [ ] Monitoring uptime (Sentry, DataDog, etc.)
- [ ] Alertes pour erreurs critiques
- [ ] Métriques d'authentification (success rate, latency)

### Email
- [ ] Vérifier le domaine dans Resend
- [ ] Configurer SPF/DKIM records
- [ ] Tester tous les templates email
- [ ] Rate limiting envoi emails
- [ ] Gérer les bounces/complaints

### Performance
- [ ] Implémenter caching (Redis) pour tokens
- [ ] Optimiser les requêtes TypeORM (eager loading)
- [ ] Compresser les réponses (compression middleware)
- [ ] CDN pour assets statiques

### Documentation
- [ ] Documenter tous les endpoints (Swagger/OpenAPI)
- [ ] Guide d'intégration frontend
- [ ] Runbook pour incidents
- [ ] Diagrammes d'architecture

---

## 📚 Ressources & Références

### Documentation Officielle
- [NestJS Authentication](https://docs.nestjs.com/security/authentication)
- [Passport.js Strategies](http://www.passportjs.org/packages/)
- [TypeORM Documentation](https://typeorm.io/)
- [Resend API Docs](https://resend.com/docs)

### Sécurité
- [OWASP Authentication Cheatsheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [Token Rotation Explained](https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation)

### Exemples de Code
- [NestJS JWT Auth Example](https://github.com/nestjs/nest/tree/master/sample/19-auth-jwt)
- [TypeORM Migrations](https://typeorm.io/migrations)

---

## 🤝 Support & Questions

Si vous avez des questions pendant l'implémentation:
1. Consultez cette spécification
2. Référez-vous à la documentation officielle
3. Testez chaque feature individuellement
4. N'hésitez pas à demander de l'aide

**Bonne implémentation!** 🚀
