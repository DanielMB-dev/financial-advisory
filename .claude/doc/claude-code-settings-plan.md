# Plan de Configuración Claude Code para MVP de Finanzas

## 📋 Resumen Ejecutivo

Plan completo para desarrollar un MVP de aplicación web de finanzas usando Claude Code con enfoque en **Spec-Driven Design**, TDD, arquitectura hexagonal, y mejores prácticas de desarrollo.

---

## 🎯 Objetivo del MVP

**Aplicación web de finanzas personal** que permita:

- Trackeo manual de ingresos y egresos
- Gestión de activos y pasivos
- Visualización de estado financiero
- Categorización de transacciones
- Reportes básicos

---

## 🏗️ Stack Tecnológico Recomendado

### Frontend

- **Framework**: Next.js 14+ (App Router)
- **UI**: shadcn/ui + Radix UI + Tailwind CSS
- **Estado**: React Query + Context API
- **Validación**: Zod
- **Testing**: Vitest + React Testing Library
- **E2E**: Playwright

### Backend

- **Runtime**: Next.js API Routes (App Router)
- **Arquitectura**: Hexagonal (Ports & Adapters)
- **Database**: Supabase (PostgreSQL with RLS)
- **Auth**: Supabase Auth
- **Validación**: Zod
- **Testing**: Jest/Vitest

### DevOps & Seguridad

- **Auth**: Supabase Auth (JWT-based)
- **Security**: Row Level Security (RLS) policies
- **Deployment**: Vercel
- **Environment**: Variables de entorno con validación
- **Secrets**: Supabase environment variables

---

## 🤖 Análisis de Agentes Actuales

### Agentes Disponibles y su Uso

| Agente                          | Color     | Cuándo Usar                    | Propósito en el Proyecto                                                                                                        |
| ------------------------------- | --------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| **hexagonal-backend-architect** | 🔴 Red    | Diseño de arquitectura backend | Diseñar domain models, use cases, ports/adapters para finanzas. Diseñar Supabase adapters y RLS policies en lugar de middleware |
| **backend-test-architect**      | 🟡 Yellow | Testing backend                | Tests unitarios para domain logic, use cases, repositories. Tests con Supabase local y mocking de Supabase client               |
| **frontend-developer**          | 🔵 Cyan   | Implementación frontend        | Implementar features de UI siguiendo patrones establecidos                                                                      |
| **frontend-test-engineer**      | 🟡 Yellow | Testing frontend               | Tests para componentes React, hooks, services                                                                                   |
| **shadcn-ui-architect**         | 🔴 Red    | Diseño de UI                   | Diseñar interfaces con shadcn/ui components                                                                                     |
| **typescript-test-explorer**    | 🟢 Green  | Diseño de test cases           | Identificar edge cases y crear test plans comprehensivos                                                                        |
| **qa-criteria-validator**       | 🟡 Yellow | QA y validación                | Definir acceptance criteria y validar con Playwright                                                                            |
| **ui-ux-analyzer**              | 🔵 Cyan   | Análisis de UX                 | Revisar UI implementada y sugerir mejoras                                                                                       |

### ✅ Agentes Existentes - Perfectos para el Proyecto

Todos los agentes actuales son útiles y bien diseñados. No necesitas crear nuevos agentes.

---

## 🔧 Agentes Adicionales Sugeridos (Opcional)

### 1. **security-architect** (⚫ Black)

**Propósito**: Auditoría de seguridad y mejores prácticas con focus en Supabase
**Cuándo usar**:

- Antes de implementar autenticación con Supabase
- Review de RLS policies
- Validación de auth flows con Supabase
- Review de manejo de datos sensibles
- Validación de input/output
- Auditoría de dependencias

**Responsabilidades**:

- Focus en RLS policies design y validación
- Validar auth flows con Supabase Auth
- OWASP Top 10 compliance
- Supabase security best practices
- SQL injection prevention via RLS
- XSS/CSRF protection
- Rate limiting strategies
- Secure JWT token management

### 2. **database-architect** (🟣 Purple)

**Propósito**: Diseño de schema y optimización de queries con Supabase
**Cuándo usar**:

- Diseño inicial de schema
- Optimización de queries
- Migrations strategy con Supabase CLI
- Index planning
- RLS policies design

**Responsabilidades**:

- Supabase schema design (PostgreSQL)
- Migrations management con Supabase CLI
- Query optimization con Supabase client
- Data integrity constraints
- RLS policies implementation
- Backup strategies

### 3. **devops-engineer** (🟠 Orange)

**Propósito**: CI/CD, deployment, monitoring
**Cuándo usar**:

- Setup inicial de proyecto
- Configuración de pipelines
- Deployment strategies
- Performance monitoring

**Responsabilidades**:

- GitHub Actions workflows
- Environment configuration
- Error tracking setup (Sentry)
- Performance monitoring
- Log aggregation

---

## 📚 Skills Requeridos

### Skills Públicos (ya disponibles)

✅ **docx**: Para documentación
✅ **pdf**: Para generar reportes financieros
✅ **pptx**: Para presentaciones de progreso
✅ **xlsx**: Para exports de datos financieros
✅ **skill-creator**: Para crear nuevos skills

### Skills Adicionales Necesarios

#### 1. **supabase-auth-integrator**

```markdown
Location: /mnt/skills/user/supabase-auth-integrator/SKILL.md
Purpose: Integración de Supabase Auth con Next.js, manejo de sesiones JWT, y patrones de autenticación
```

#### 2. **supabase-rls-patterns**

```markdown
Location: /mnt/skills/user/supabase-rls-patterns/SKILL.md
Purpose: Diseño e implementación de Row Level Security policies optimizadas para casos de uso financieros
```

#### 3. **supabase-realtime-patterns**

```markdown
Location: /mnt/skills/user/supabase-realtime-patterns/SKILL.md
Purpose: Patrones de uso de Supabase Realtime para actualizaciones en tiempo real de datos financieros
```

#### 4. **api-security-validator**

```markdown
Location: /mnt/skills/user/api-security-validator/SKILL.md
Purpose: Validación de endpoints siguiendo OWASP guidelines y Supabase security best practices
```

#### 5. **finance-domain-modeler**

```markdown
Location: /mnt/skills/user/finance-domain-modeler/SKILL.md
Purpose: Patrones específicos para modelado de entidades financieras (transacciones, cuentas, categorías) con Supabase
```

#### 6. **react-query-patterns**

```markdown
Location: /mnt/skills/user/react-query-patterns/SKILL.md
Purpose: Patrones de caching, invalidation, y optimistic updates para React Query
```

---

## ⚡ Comandos Personalizados Necesarios

### 1. `/feature-start`

**Propósito**: Iniciar desarrollo de nueva feature con spec-driven approach

**Workflow**:

1. Crear `.claude/sessions/context_session_{feature_name}.md`
2. Definir acceptance criteria con `qa-criteria-validator`
3. Crear structure de archivos base

**Ejemplo**:

```bash
/feature-start income-tracking
```

### 2. `/backend-design`

**Propósito**: Diseñar arquitectura backend para feature

**Workflow**:

1. Invocar `hexagonal-backend-architect`
2. Generar `.claude/doc/{feature_name}/backend.md`
3. Crear estructura de carpetas domain/application/infrastructure

**Ejemplo**:

```bash
/backend-design income-tracking
```

### 3. `/frontend-design`

**Propósito**: Diseñar arquitectura frontend para feature

**Workflow**:

1. Invocar `shadcn-ui-architect` para diseño UI
2. Invocar `frontend-developer` para implementación
3. Generar `.claude/doc/{feature_name}/frontend.md` y `shadcn_ui.md`

**Ejemplo**:

```bash
/frontend-design income-tracking
```

### 4. `/test-strategy`

**Propósito**: Crear estrategia de testing completa

**Workflow**:

1. Invocar `typescript-test-explorer` para test cases
2. Generar `.claude/doc/{feature_name}/test_cases.md`
3. Crear estructura de tests

**Ejemplo**:

```bash
/test-strategy income-tracking
```

### 5. `/implement-backend`

**Propósito**: Implementar backend siguiendo el plan

**Workflow**:

1. Leer `.claude/doc/{feature_name}/backend.md`
2. Crear domain entities
3. Crear use cases
4. Crear repositories
5. Crear API routes
6. Invocar `backend-test-architect` para tests

**Ejemplo**:

```bash
/implement-backend income-tracking
```

### 6. `/implement-frontend`

**Propósito**: Implementar frontend siguiendo el plan

**Workflow**:

1. Leer `.claude/doc/{feature_name}/frontend.md` y `shadcn_ui.md`
2. Crear components
3. Crear hooks (queries, mutations, context)
4. Crear services y schemas
5. Invocar `frontend-test-engineer` para tests

**Ejemplo**:

```bash
/implement-frontend income-tracking
```

### 7. `/validate-feature`

**Propósito**: Validar feature completa

**Workflow**:

1. Invocar `qa-criteria-validator` con Playwright
2. Invocar `ui-ux-analyzer` para feedback de UX
3. Generar reporte de validación
4. Actualizar PR con feedback

**Ejemplo**:

```bash
/validate-feature income-tracking
```

### 8. `/security-audit`

**Propósito**: Auditoría de seguridad

**Workflow**:

1. Invocar `security-architect` (si existe)
2. Revisar authentication flows
3. Validar input sanitization
4. Check OWASP Top 10
5. Generar reporte de seguridad

**Ejemplo**:

```bash
/security-audit income-tracking
```

### 9. `/feature-complete`

**Propósito**: Finalizar y documentar feature

**Workflow**:

1. Consolidar toda la documentación
2. Generar changelog
3. Actualizar README
4. Marcar feature como completa

**Ejemplo**:

```bash
/feature-complete income-tracking
```

---

## 🗂️ Estructura de Directorios Propuesta

```
finance-mvp/
├── .claude/
│   ├── doc/
│   │   └── {feature_name}/
│   │       ├── backend.md
│   │       ├── frontend.md
│   │       ├── shadcn_ui.md
│   │       ├── test_cases.md
│   │       ├── ui_analysis.md
│   │       └── validation_report.md
│   ├── sessions/
│   │   └── context_session_{feature_name}.md
│   └── agents/
│       ├── hexagonal-backend-architect.md
│       ├── frontend-developer.md
│       ├── shadcn-ui-architect.md
│       ├── backend-test-architect.md
│       ├── frontend-test-engineer.md
│       ├── typescript-test-explorer.md
│       ├── qa-criteria-validator.md
│       ├── ui-ux-analyzer.md
│       ├── security-architect.md (nuevo)
│       ├── database-architect.md (nuevo)
│       └── devops-engineer.md (nuevo)
├── supabase/
│   ├── migrations/
│   └── config.toml
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── {feature}/
│   │   │       └── route.ts
│   │   ├── {feature}/
│   │   │   ├── page.tsx
│   │   │   └── components/
│   │   └── layout.tsx
│   ├── features/
│   │   └── {feature}/
│   │       ├── domain/
│   │       │   ├── entities/
│   │       │   ├── value-objects/
│   │       │   └── events/
│   │       ├── application/
│   │       │   ├── use-cases/
│   │       │   └── ports/
│   │       ├── infrastructure/
│   │       │   ├── adapters/
│   │       │   └── repositories/
│   │       ├── data/
│   │       │   ├── services/
│   │       │   └── schemas/
│   │       └── hooks/
│   │           ├── queries/
│   │           ├── mutations/
│   │           ├── use{Feature}Context.tsx
│   │           └── use{Feature}.tsx
│   ├── components/
│   │   └── ui/
│   ├── lib/
│   └── tests/
│       ├── unit/
│       ├── integration/
│       └── e2e/
├── tests/
│   └── e2e/
│       └── {feature}.spec.ts
└── docs/
    ├── architecture/
    ├── api/
    └── features/
```

---

## 🚀 Flujo de Trabajo Feature-Based (Spec-Driven)

### Fase 1: Especificación (Spec-Driven) 📝

#### Paso 1.1: Iniciar Feature

```bash
/feature-start {feature-name}
```

**Agente**: N/A (comando automatizado)

**Output**:

- `.claude/sessions/context_session_{feature_name}.md`
- Estructura de carpetas base

**Contenido del Context Session**:

```markdown
# Feature: {feature-name}

## Business Requirements

[Descripción de la feature desde perspectiva de negocio]

## User Stories

- Como [usuario], quiero [acción], para [beneficio]

## Acceptance Criteria

[Se completará con qa-criteria-validator]

## Technical Constraints

- Performance requirements
- Security requirements
- Scalability considerations

## Dependencies

- Features requeridas
- External services

## Timeline

- Estimated effort
- Priority level
```

#### Paso 1.2: Definir Acceptance Criteria

```bash
# El agente lee el context session automáticamente
```

**Agente**: `qa-criteria-validator` 🟡

**Proceso**:

1. Lee `.claude/sessions/context_session_{feature_name}.md`
2. Analiza business requirements
3. Define acceptance criteria en formato Given-When-Then
4. Identifica casos edge
5. Define non-functional requirements

**Output**: Actualiza context session con acceptance criteria detallados

**Ejemplo Output**:

```markdown
## Acceptance Criteria

### 1. Registro de Ingreso Manual

**Given** usuario está en dashboard de finanzas
**When** hace click en "Agregar Ingreso"
**And** completa formulario con monto, categoría y fecha
**And** hace click en "Guardar"
**Then** el ingreso se guarda en base de datos
**And** aparece en lista de transacciones
**And** se actualiza el balance total
**And** muestra mensaje de confirmación

### 2. Validación de Datos

**Given** usuario intenta crear ingreso
**When** ingresa monto negativo
**Then** muestra error "El monto debe ser positivo"
**And** no permite guardar

### Edge Cases:

- Monto = 0
- Fecha futura
- Categoría no existente
- Sin conexión a internet
- Transacción duplicada
```

---

### Fase 2: Diseño de Arquitectura 🏛️

#### Paso 2.1: Diseño Backend

```bash
/backend-design {feature-name}
```

**Agente**: `hexagonal-backend-architect` 🔴

**Proceso**:

1. Lee context session para entender requirements
2. Aplica DDD y hexagonal architecture
3. Define domain entities, value objects, aggregates
4. Define application use cases
5. Define ports (interfaces)
6. Define adapters (implementations)
7. Diseña API routes

**Output**: `.claude/doc/{feature_name}/backend.md`

**Contenido del Plan**:

````markdown
# Backend Implementation Plan: {feature-name}

## Domain Layer

### Entities

#### Income (Aggregate Root)

```typescript
// src/features/income/domain/entities/Income.ts
interface Income {
  id: IncomeId
  userId: UserId
  amount: Money
  category: Category
  date: TransactionDate
  description: Description
  createdAt: DateTime
  updatedAt: DateTime
}
```
````

### Value Objects

- Money: Encapsula monto y moneda
- TransactionDate: Validación de fechas
- Category: Enum de categorías

### Domain Events

- IncomeCreated
- IncomeUpdated
- IncomeDeleted

## Application Layer

### Use Cases

1. **CreateIncomeUseCase**
   - Input: CreateIncomeDTO
   - Output: Income
   - Validaciones: monto positivo, fecha válida
2. **GetUserIncomesUseCase**
   - Input: UserId, DateRange (optional)
   - Output: Income[]

### Ports (Interfaces)

```typescript
// src/features/income/application/ports/IncomeRepository.ts
interface IIncomeRepository {
  create(income: Income): Promise<Income>
  findById(id: IncomeId): Promise<Income | null>
  findByUserId(userId: UserId, filters?: Filters): Promise<Income[]>
  update(income: Income): Promise<Income>
  delete(id: IncomeId): Promise<void>
}
```

## Infrastructure Layer

### Adapters

#### SupabaseIncomeRepository

```typescript
// src/features/income/infrastructure/repositories/SupabaseIncomeRepository.ts
class SupabaseIncomeRepository implements IIncomeRepository {
  // Implementation using Supabase Client
}
```

### Database Schema

```sql
-- supabase/migrations/{timestamp}_create_income_table.sql
CREATE TABLE incomes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  category_id UUID NOT NULL REFERENCES categories(id),
  date TIMESTAMP NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX incomes_user_id_idx ON incomes(user_id);
CREATE INDEX incomes_date_idx ON incomes(date);

-- RLS Policies
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own incomes"
  ON incomes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own incomes"
  ON incomes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own incomes"
  ON incomes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own incomes"
  ON incomes FOR DELETE
  USING (auth.uid() = user_id);
```

## Web Layer (API Routes)

### POST /api/incomes

```typescript
// src/app/api/incomes/route.ts
export async function POST(req: NextRequest) {
  // 1. Extract and validate request body
  // 2. Get user session
  // 3. Invoke CreateIncomeUseCase
  // 4. Return response
}
```

## Files to Create

1. Domain Layer:
   - `src/features/income/domain/entities/Income.ts`
   - `src/features/income/domain/value-objects/Money.ts`
   - `src/features/income/domain/value-objects/TransactionDate.ts`
   - `src/features/income/domain/events/IncomeCreated.ts`

2. Application Layer:
   - `src/features/income/application/use-cases/CreateIncomeUseCase.ts`
   - `src/features/income/application/use-cases/GetUserIncomesUseCase.ts`
   - `src/features/income/application/ports/IIncomeRepository.ts`
   - `src/features/income/application/dtos/CreateIncomeDTO.ts`

3. Infrastructure Layer:
   - `src/features/income/infrastructure/repositories/SupabaseIncomeRepository.ts`
   - `src/features/income/infrastructure/mappers/IncomeSupabaseMapper.ts`
   - `supabase/migrations/{timestamp}_create_income_table.sql`

4. Web Layer:
   - `src/app/api/incomes/route.ts`
   - `src/app/api/incomes/[id]/route.ts`

## Important Notes

- Use Money value object to prevent floating point issues
- Implement proper transaction boundaries in use cases
- Define comprehensive RLS policies for data security
- Use Supabase client with proper authentication context
- Add rate limiting to API routes
- Ensure proper error handling and logging
- Validate auth tokens on every request

````

#### Paso 2.2: Diseño UI/UX
```bash
/frontend-design {feature-name}
````

**Agentes**:

1. `shadcn-ui-architect` 🔴 (primero)
2. `frontend-developer` 🔵 (segundo)

**Proceso**:

**Parte 1 - UI Design (shadcn-ui-architect)**:

1. Lee context session
2. Lista componentes shadcn disponibles
3. Diseña wireframes conceptuales
4. Define componentes a usar
5. Crea mockups de estructura

**Output**: `.claude/doc/{feature_name}/shadcn_ui.md`

**Parte 2 - Frontend Architecture (frontend-developer)**:

1. Lee shadcn_ui.md
2. Define arquitectura de features
3. Diseña schemas Zod
4. Diseña services
5. Diseña hooks structure

**Output**: `.claude/doc/{feature_name}/frontend.md`

**Ejemplo shadcn_ui.md**:

```markdown
# UI Design Plan: Income Tracking

## Component Selection

### Main Components

1. **Dialog** - Para formulario de agregar ingreso
2. **Form** - Para input fields con validación
3. **Input** - Campo de monto
4. **Select** - Selector de categoría
5. **Calendar** - Date picker
6. **Table** - Lista de ingresos
7. **Card** - Contenedor de estadísticas
8. **Badge** - Categorías visuales

### Layout Structure
```

<Dashboard>
  <StatsCards>
    <Card> Total Ingresos </Card>
    <Card> Total Egresos </Card>
    <Card> Balance </Card>
  </StatsCards>
  
  <IncomesTable>
    <TableHeader />
    <TableBody>
      {incomes.map(income => <IncomeRow />)}
    </TableBody>
  </IncomesTable>
  
  <AddIncomeDialog>
    <DialogTrigger>
      <Button>Agregar Ingreso</Button>
    </DialogTrigger>
    <DialogContent>
      <IncomeForm />
    </DialogContent>
  </AddIncomeDialog>
</Dashboard>
```

## Component Details

### IncomeForm Component

```typescript
// Uses shadcn components:
- Form (react-hook-form + zod)
- Input (amount)
- Select (category)
- Calendar (date picker)
- Textarea (description)
- Button (submit)

// Color scheme (from src/index.css):
- Primary: hsl(var(--primary))
- Success: hsl(var(--success))
- Error: hsl(var(--destructive))
```

### IncomesTable Component

```typescript
// Uses shadcn components:
- Table with sorting
- Badge for categories
- DropdownMenu for actions (edit, delete)
- Pagination
```

````

**Ejemplo frontend.md**:
```markdown
# Frontend Implementation Plan: Income Tracking

## Feature Structure
````

src/features/income/
├── data/
│ ├── services/
│ │ └── incomeService.ts
│ └── schemas/
│ ├── income.schema.ts
│ └── createIncome.schema.ts
├── hooks/
│ ├── queries/
│ │ ├── useIncomesQuery.ts
│ │ └── useIncomeQuery.ts
│ ├── mutations/
│ │ ├── useCreateIncomeMutation.ts
│ │ ├── useUpdateIncomeMutation.ts
│ │ └── useDeleteIncomeMutation.ts
│ └── useIncome.ts
└── components/
├── IncomeForm.tsx
├── IncomesTable.tsx
└── IncomeStats.tsx

````

## 1. Schemas (Zod)

### income.schema.ts
```typescript
import { z } from 'zod'

export const incomeSchema = z.object({
  id: z.string().cuid(),
  userId: z.string(),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  categoryId: z.string(),
  category: z.object({
    id: z.string(),
    name: z.string(),
    color: z.string()
  }),
  date: z.coerce.date(),
  description: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
})

export const createIncomeSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  categoryId: z.string().min(1, 'Category is required'),
  date: z.coerce.date(),
  description: z.string().optional()
})

export type Income = z.infer<typeof incomeSchema>
export type CreateIncomeInput = z.infer<typeof createIncomeSchema>
````

## 2. Services

### incomeService.ts

```typescript
import axios from 'axios'
import { Income, CreateIncomeInput } from '../schemas/income.schema'

export const incomeService = {
  async getAll(): Promise<Income[]> {
    const response = await axios.get('/api/incomes')
    return response.data
  },

  async create(input: CreateIncomeInput): Promise<Income> {
    const response = await axios.post('/api/incomes', input)
    return response.data
  },

  async update(id: string, input: Partial<CreateIncomeInput>): Promise<Income> {
    const response = await axios.patch(`/api/incomes/${id}`, input)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await axios.delete(`/api/incomes/${id}`)
  },
}
```

## 3. Query Hooks

### useIncomesQuery.ts

```typescript
import { useQuery } from '@tanstack/react-query'
import { incomeService } from '@/features/income/data/services/incomeService'

export function useIncomesQuery() {
  return useQuery({
    queryKey: ['incomes'],
    queryFn: incomeService.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
```

## 4. Mutation Hooks

### useCreateIncomeMutation.ts

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { incomeService } from '@/features/income/data/services/incomeService'
import { CreateIncomeInput } from '../schemas/income.schema'

export function useCreateIncomeMutation() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (input: CreateIncomeInput) => incomeService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] })
    },
  })

  return {
    createIncome: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  }
}
```

## 5. Business Hook

### useIncome.ts

```typescript
import { useIncomesQuery } from './queries/useIncomesQuery'
import { useCreateIncomeMutation } from './mutations/useCreateIncomeMutation'
import { useUpdateIncomeMutation } from './mutations/useUpdateIncomeMutation'
import { useDeleteIncomeMutation } from './mutations/useDeleteIncomeMutation'

export function useIncome() {
  const { data: incomes, isLoading, error } = useIncomesQuery()
  const { createIncome, isLoading: isCreating } = useCreateIncomeMutation()
  const { updateIncome, isLoading: isUpdating } = useUpdateIncomeMutation()
  const { deleteIncome, isLoading: isDeleting } = useDeleteIncomeMutation()

  const totalIncome = incomes?.reduce((sum, income) => sum + income.amount, 0) ?? 0

  return {
    incomes,
    totalIncome,
    isLoading,
    error,
    createIncome,
    updateIncome,
    deleteIncome,
    isProcessing: isCreating || isUpdating || isDeleting,
  }
}
```

## 6. Components

### IncomeForm.tsx

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createIncomeSchema, CreateIncomeInput } from '../data/schemas/income.schema'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCreateIncomeMutation } from '../hooks/mutations/useCreateIncomeMutation'

export function IncomeForm({ onSuccess }: { onSuccess?: () => void }) {
  const { createIncome, isLoading } = useCreateIncomeMutation()

  const form = useForm<CreateIncomeInput>({
    resolver: zodResolver(createIncomeSchema),
    defaultValues: {
      amount: 0,
      date: new Date()
    }
  })

  const onSubmit = (data: CreateIncomeInput) => {
    createIncome(data, {
      onSuccess: () => {
        form.reset()
        onSuccess?.()
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Form fields */}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Income'}
        </Button>
      </form>
    </Form>
  )
}
```

## Files to Create

1. **Schemas**:
   - `src/features/income/data/schemas/income.schema.ts`
   - `src/features/income/data/schemas/createIncome.schema.ts`

2. **Services**:
   - `src/features/income/data/services/incomeService.ts`

3. **Query Hooks**:
   - `src/features/income/hooks/queries/useIncomesQuery.ts`
   - `src/features/income/hooks/queries/useIncomeQuery.ts`

4. **Mutation Hooks**:
   - `src/features/income/hooks/mutations/useCreateIncomeMutation.ts`
   - `src/features/income/hooks/mutations/useUpdateIncomeMutation.ts`
   - `src/features/income/hooks/mutations/useDeleteIncomeMutation.ts`

5. **Business Hook**:
   - `src/features/income/hooks/useIncome.ts`

6. **Components**:
   - `src/features/income/components/IncomeForm.tsx`
   - `src/features/income/components/IncomesTable.tsx`
   - `src/features/income/components/IncomeStats.tsx`
   - `src/app/dashboard/incomes/page.tsx`

## Important Notes

- All schemas must use Zod for runtime validation
- Services are pure functions that return promises
- Hooks follow React Query patterns for caching
- Components are pure presentation layer
- Business logic lives in hooks, not components
- Use shadcn components from `.claude/doc/{feature_name}/shadcn_ui.md`
- Colors from `src/index.css`

````

---

### Fase 3: Estrategia de Testing 🧪

#### Paso 3.1: Definir Test Cases
```bash
/test-strategy {feature-name}
````

**Agente**: `typescript-test-explorer` 🟢

**Proceso**:

1. Lee backend.md y frontend.md
2. Identifica todos los componentes testables
3. Define test cases por capa (domain, application, infrastructure, UI)
4. Identifica edge cases
5. Define test data builders

**Output**: `.claude/doc/{feature_name}/test_cases.md`

**Ejemplo Output**:

````markdown
# Test Strategy: Income Tracking

## Backend Tests

### Domain Layer Tests

#### Income Entity

**File**: `src/features/income/domain/entities/__tests__/Income.test.ts`

**Test Cases**:

1. **Creation**
   - ✅ should create income with valid data
   - ✅ should generate unique ID
   - ✅ should set createdAt and updatedAt

2. **Validation**
   - ❌ should reject negative amount
   - ❌ should reject zero amount
   - ❌ should reject future dates beyond 1 day
   - ❌ should reject missing category

3. **Business Rules**
   - ✅ should allow updating description
   - ✅ should prevent changing userId after creation
   - ✅ should update updatedAt on modification

#### Money Value Object

**File**: `src/features/income/domain/value-objects/__tests__/Money.test.ts`

**Test Cases**:

1. **Creation**
   - ✅ should create with valid amount
   - ✅ should default to USD currency
   - ✅ should support multiple currencies

2. **Edge Cases**
   - ❌ should reject NaN
   - ❌ should reject Infinity
   - ❌ should reject negative values
   - ✅ should handle zero correctly
   - ✅ should handle very large numbers (MAX_SAFE_INTEGER)
   - ✅ should handle decimal precision (2 decimal places)

3. **Operations**
   - ✅ should add two Money objects
   - ✅ should subtract Money objects
   - ❌ should reject operations with different currencies
   - ✅ should compare Money objects
   - ✅ should format display strings

### Application Layer Tests

#### CreateIncomeUseCase

**File**: `src/features/income/application/use-cases/__tests__/CreateIncomeUseCase.test.ts`

**Test Cases**:

1. **Happy Path**
   - ✅ should create income with valid data
   - ✅ should return created income
   - ✅ should emit IncomeCreated event

2. **Validation**
   - ❌ should reject invalid DTO
   - ❌ should reject non-existent category
   - ❌ should reject unauthorized user

3. **Repository Interactions**
   - ✅ should call repository.create once
   - ✅ should pass correct data to repository

4. **Error Handling**
   - ❌ should throw DomainException for business rule violations
   - ❌ should throw InfrastructureException for DB errors

### Infrastructure Layer Tests

#### SupabaseIncomeRepository

**File**: `src/features/income/infrastructure/repositories/__tests__/SupabaseIncomeRepository.test.ts`

**Test Cases**:

1. **CRUD Operations**
   - ✅ should create income in database
   - ✅ should find income by ID
   - ✅ should find all incomes by userId
   - ✅ should update income
   - ✅ should delete income

2. **Data Mapping**
   - ✅ should map domain entity to Supabase model
   - ✅ should map Supabase model to domain entity
   - ✅ should handle null optional fields

3. **Queries with Filters**
   - ✅ should filter by date range
   - ✅ should filter by category
   - ✅ should paginate results

4. **RLS Policy Testing**
   - ✅ should respect RLS policies for SELECT
   - ✅ should respect RLS policies for INSERT
   - ✅ should respect RLS policies for UPDATE
   - ✅ should respect RLS policies for DELETE
   - ❌ should reject unauthorized access

5. **Error Handling**
   - ❌ should throw NotFoundError when income not exists
   - ❌ should throw DatabaseError on connection failure

### Web Layer Tests

#### POST /api/incomes

**File**: `src/app/api/incomes/__tests__/route.test.ts`

**Test Cases**:

1. **Authentication**
   - ❌ should return 401 if not authenticated
   - ✅ should accept authenticated requests

2. **Request Validation**
   - ❌ should return 400 for invalid body
   - ❌ should return 400 for missing required fields
   - ✅ should accept valid request body

3. **Success Response**
   - ✅ should return 201 with created income
   - ✅ should return income in response body

4. **Error Responses**
   - ❌ should return 400 for business rule violations
   - ❌ should return 500 for unexpected errors

## Frontend Tests

### Component Tests

#### IncomeForm

**File**: `src/features/income/components/__tests__/IncomeForm.test.tsx`

**Test Cases**:

1. **Rendering**
   - ✅ should render all form fields
   - ✅ should render submit button
   - ✅ should show loading state

2. **User Interactions**
   - ✅ should update amount field on input
   - ✅ should select category from dropdown
   - ✅ should select date from calendar

3. **Validation**
   - ❌ should show error for negative amount
   - ❌ should show error for missing category
   - ❌ should disable submit with invalid data

4. **Submission**
   - ✅ should call createIncome on submit
   - ✅ should reset form on success
   - ✅ should call onSuccess callback

#### IncomesTable

**File**: `src/features/income/components/__tests__/IncomesTable.test.tsx`

**Test Cases**:

1. **Rendering**
   - ✅ should render loading state
   - ✅ should render empty state
   - ✅ should render list of incomes

2. **User Interactions**
   - ✅ should sort by amount
   - ✅ should sort by date
   - ✅ should open edit dialog on edit click
   - ✅ should call delete on delete click

3. **Data Display**
   - ✅ should format amounts correctly
   - ✅ should format dates correctly
   - ✅ should show category badges

### Hook Tests

#### useIncome

**File**: `src/features/income/hooks/__tests__/useIncome.test.ts`

**Test Cases**:

1. **Data Fetching**
   - ✅ should fetch incomes on mount
   - ✅ should return loading state
   - ✅ should return error state
   - ✅ should return data on success

2. **Computed Values**
   - ✅ should calculate totalIncome correctly
   - ✅ should handle empty incomes array

3. **Mutations**
   - ✅ should create income
   - ✅ should update income
   - ✅ should delete income
   - ✅ should invalidate cache after mutation

### Service Tests

#### incomeService

**File**: `src/features/income/data/services/__tests__/incomeService.test.ts`

**Test Cases**:

1. **HTTP Requests**
   - ✅ should make GET request to /api/incomes
   - ✅ should make POST request with correct body
   - ✅ should make PATCH request with correct ID
   - ✅ should make DELETE request with correct ID

2. **Response Handling**
   - ✅ should return parsed data
   - ❌ should throw on 4xx errors
   - ❌ should throw on 5xx errors

3. **Error Handling**
   - ❌ should handle network errors
   - ❌ should handle timeout errors

## E2E Tests (Playwright)

### Income Management Flow

**File**: `tests/e2e/income-management.spec.ts`

**Test Cases**:

1. **Create Income**
   - ✅ User can navigate to incomes page
   - ✅ User can open add income dialog
   - ✅ User can fill form and submit
   - ✅ Income appears in table
   - ✅ Total updates correctly

2. **Edit Income**
   - ✅ User can click edit on income
   - ✅ Form pre-fills with current data
   - ✅ User can update and save
   - ✅ Changes reflect in table

3. **Delete Income**
   - ✅ User can click delete
   - ✅ Confirmation dialog appears
   - ✅ Income removed from table
   - ✅ Total updates correctly

4. **Validation Errors**
   - ❌ Shows error for invalid amount
   - ❌ Shows error for missing category
   - ❌ Prevents submission

## Test Data Builders

### IncomeBuilder

```typescript
export class IncomeBuilder {
  private income: Partial<Income> = {
    id: 'test-id',
    userId: 'user-123',
    amount: 1000,
    currency: 'USD',
    categoryId: 'cat-1',
    date: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  withAmount(amount: number): this {
    this.income.amount = amount
    return this
  }

  withCategory(categoryId: string): this {
    this.income.categoryId = categoryId
    return this
  }

  build(): Income {
    return this.income as Income
  }
}
```
````

## Coverage Goals

- **Domain Layer**: 100%
- **Application Layer**: 95%
- **Infrastructure Layer**: 80%
- **Web Layer**: 90%
- **Frontend Components**: 85%
- **Frontend Hooks**: 90%

## Test Execution Order

1. Unit tests (domain + application)
2. Integration tests (infrastructure + web)
3. Component tests (UI)
4. E2E tests (full flows)

````

---

### Fase 4: Implementación 💻

#### Paso 4.1: Implementar Backend
```bash
/implement-backend {feature-name}
````

**Proceso**:

1. Lee `.claude/doc/{feature_name}/backend.md`
2. Crea estructura de carpetas
3. Implementa domain layer
4. Implementa application layer
5. Implementa infrastructure layer
6. Implementa API routes
7. Invoca `backend-test-architect` para crear tests
8. Ejecuta tests

**Agentes involucrados**:

- Implementación: Ejecución directa de código
- `backend-test-architect` 🟡: Para crear tests unitarios

**Output**:

- Código implementado en `src/features/{feature}/`
- Tests en `src/features/{feature}/**/__tests__/`

#### Paso 4.2: Implementar Frontend

```bash
/implement-frontend {feature-name}
```

**Proceso**:

1. Lee `.claude/doc/{feature_name}/frontend.md` y `shadcn_ui.md`
2. Crea estructura de carpetas
3. Implementa schemas
4. Implementa services
5. Implementa hooks (queries, mutations, business)
6. Implementa componentes UI
7. Invoca `frontend-test-engineer` para crear tests
8. Ejecuta tests

**Agentes involucrados**:

- Implementación: Ejecución directa de código
- `frontend-test-engineer` 🟡: Para crear tests de componentes y hooks

**Output**:

- Código implementado en `src/features/{feature}/`
- Components en `src/features/{feature}/components/`
- Tests en `src/features/{feature}/**/__tests__/`

---

### Fase 5: Validación y QA ✅

#### Paso 5.1: Validar Feature

```bash
/validate-feature {feature-name}
```

**Agentes involucrados**:

1. `qa-criteria-validator` 🟡
2. `ui-ux-analyzer` 🔵

**Proceso QA**:

1. `qa-criteria-validator` ejecuta tests Playwright
2. Valida contra acceptance criteria
3. Genera reporte de validación
4. Actualiza PR con feedback

**Proceso UX**:

1. `ui-ux-analyzer` navega a la página
2. Captura screenshots
3. Analiza diseño y usabilidad
4. Genera reporte de UX
5. Sugiere mejoras

**Output**:

- `.claude/doc/{feature_name}/validation_report.md`
- `.claude/doc/{feature_name}/ui_analysis.md`

#### Paso 5.2: Auditoría de Seguridad (Opcional)

```bash
/security-audit {feature-name}
```

**Agente**: `security-architect` ⚫ (si se crea)

**Proceso**:

1. Revisa authentication flows
2. Valida input sanitization
3. Chequea OWASP Top 10
4. Revisa manejo de secrets
5. Valida rate limiting

**Output**: `.claude/doc/{feature_name}/security_report.md`

---

### Fase 6: Finalización 🎉

#### Paso 6.1: Completar Feature

```bash
/feature-complete {feature-name}
```

**Proceso**:

1. Consolida toda la documentación
2. Genera changelog
3. Actualiza README
4. Marca feature como completa
5. Crea PR con toda la información

---

## 📅 Roadmap de Features del MVP

### Prioridad 1: Core Features (Sprint 1-2)

#### Feature 1: Autenticación y Usuarios

**Duración estimada**: 1 semana

**Sub-features**:

- Sistema de registro
- Login/Logout
- Gestión de sesiones
- Recuperación de contraseña

**Agentes a usar**:

1. `qa-criteria-validator` - Definir acceptance criteria
2. `hexagonal-backend-architect` - Diseñar domain (User aggregate, auth use cases)
3. `backend-test-architect` - Tests para auth logic
4. `shadcn-ui-architect` - Diseño de login/register forms
5. `frontend-developer` - Implementar auth flow
6. `frontend-test-engineer` - Tests para auth components
7. `security-architect` - Auditoría de seguridad auth
8. `ui-ux-analyzer` - Validar UX de login flow

**Skills a usar**:

- `supabase-auth-integrator`
- `supabase-rls-patterns`
- `api-security-validator`

#### Feature 2: Dashboard Principal

**Duración estimada**: 1 semana

**Sub-features**:

- Vista general de balance
- Resumen de ingresos/egresos
- Gráficos básicos
- Navegación principal

**Agentes a usar**:

1. `qa-criteria-validator`
2. `shadcn-ui-architect` - Diseño de dashboard layout, cards, charts
3. `frontend-developer` - Implementar dashboard
4. `frontend-test-engineer` - Tests para dashboard components
5. `ui-ux-analyzer` - Validar UX dashboard

**Skills a usar**:

- `react-query-patterns` (para caching de estadísticas)

### Prioridad 2: Transacciones (Sprint 3-4)

#### Feature 3: Gestión de Ingresos

**Duración estimada**: 1.5 semanas

**Sub-features**:

- CRUD de ingresos
- Categorización
- Filtros y búsqueda
- Exportar a CSV/PDF

**Agentes a usar**:

1. `qa-criteria-validator`
2. `hexagonal-backend-architect` - Domain model para Income
3. `database-architect` - Schema design para Income
4. `backend-test-architect` - Tests para income use cases
5. `shadcn-ui-architect` - UI para income management
6. `frontend-developer` - Implementar income features
7. `frontend-test-engineer` - Tests para income components
8. `typescript-test-explorer` - Test cases comprehensivos
9. `qa-criteria-validator` - Validar con Playwright
10. `ui-ux-analyzer` - Feedback UX

**Skills a usar**:

- `finance-domain-modeler`
- `supabase-rls-patterns`
- `supabase-realtime-patterns`
- `xlsx` (para exports)
- `pdf` (para reportes)

#### Feature 4: Gestión de Egresos

**Duración estimada**: 1.5 semanas

Similar a Feature 3, pero para egresos.

### Prioridad 3: Activos y Pasivos (Sprint 5-6)

#### Feature 5: Gestión de Activos

**Duración estimada**: 2 semanas

**Sub-features**:

- CRUD de activos (cuentas bancarias, inversiones, propiedades)
- Tracking de valor
- Historial de cambios

**Agentes**: Similar a Feature 3

#### Feature 6: Gestión de Pasivos

**Duración estimada**: 2 semanas

**Sub-features**:

- CRUD de pasivos (deudas, préstamos, tarjetas)
- Tracking de pagos
- Cálculo de intereses

**Agentes**: Similar a Feature 3

### Prioridad 4: Reportes y Analytics (Sprint 7)

#### Feature 7: Reportes Financieros

**Duración estimada**: 1 semana

**Sub-features**:

- Reportes mensuales/anuales
- Gráficos avanzados
- Comparaciones temporales
- Proyecciones

**Agentes**:

1. `qa-criteria-validator`
2. `hexagonal-backend-architect` - Use cases para reporting
3. `shadcn-ui-architect` - UI para charts y reports
4. `frontend-developer` - Implementar visualizaciones
5. `ui-ux-analyzer` - Validar legibilidad de datos

**Skills**:

- `xlsx` (exports)
- `pdf` (reportes)

---

## 🔄 Workflow Detallado por Feature

### Template de Workflow

Para cada feature nueva, seguir este workflow:

```bash
# 1. Iniciar feature
/feature-start {feature-name}
# Crea estructura base, context session y directorios

# 2. Explorar y planificar (NUEVO)
/explore-plan {feature-name}
# Explora el codebase, selecciona agentes, crea plan detallado,
# obtiene advice de agentes especializados, y actualiza el context session
# Este comando integra:
#   - Exploración del codebase existente
#   - Selección de agentes relevantes
#   - Creación del plan de implementación
#   - Advice de agentes especializados en paralelo
#   - Iteración hasta tener plan final
#   - Clarificación de dudas con el usuario

# 3. Definir acceptance criteria (qa-criteria-validator)
# Manual: El agente leerá el context session y definirá criterios
# basados en el plan creado por explore-plan

# 4. Diseñar backend (hexagonal-backend-architect)
/backend-design {feature-name}
# Diseña la arquitectura backend siguiendo el plan

# 5. Diseñar frontend (shadcn-ui-architect + frontend-developer)
/frontend-design {feature-name}
# Diseña UI/UX y arquitectura frontend siguiendo el plan

# 6. Definir estrategia de testing (typescript-test-explorer)
/test-strategy {feature-name}
# Crea estrategia de testing comprehensiva

# 7. Implementar backend
/implement-backend {feature-name}
# Implementa backend con TDD
# Invoca internamente backend-test-architect para tests

# 8. Implementar frontend
/implement-frontend {feature-name}
# Implementa frontend con component testing
# Invoca internamente frontend-test-engineer para tests

# 9. Validar feature
/validate-feature {feature-name}
# Valida con E2E tests y análisis UX
# Invoca qa-criteria-validator + ui-ux-analyzer en paralelo

# 10. Auditoría de seguridad
/security-audit {feature-name}
# Auditoría de seguridad OWASP y mejores prácticas

# 11. Completar feature
/feature-complete {feature-name}
# Consolida documentación, genera changelog, prepara deployment
```

### Workflow Mejorado con explore-plan

El comando `/explore-plan` es **crítico** en la fase de planificación y sigue este flujo:

1. **Explore**: Explora archivos relevantes en el repositorio
2. **Team Selection**: Selecciona qué agentes especializados se necesitarán
3. **Plan**: Crea un plan de implementación detallado
4. **Advice**: Invoca agentes especializados en paralelo para obtener expertise
5. **Update**: Actualiza el context session con el plan final
6. **Clarification**: Hace preguntas al usuario sobre puntos no claros
7. **Iterate**: Refina el plan hasta llegar a la versión final

**Ventajas de explore-plan**:

- ✅ Explora el codebase existente para entender patrones
- ✅ Identifica reutilización de código existente
- ✅ Selecciona los agentes correctos para el trabajo
- ✅ Obtiene expertise especializada en paralelo
- ✅ Crea un plan más informado y realista
- ✅ Identifica dependencias y conflictos potenciales
- ✅ Clarifica ambigüedades antes de implementar

---

## 🛠️ Configuración Inicial del Proyecto

### Semana 0: Setup

#### Día 1-2: Inicialización

**Tareas**:

1. Crear proyecto Next.js 14+ con TypeScript
2. Configurar Tailwind CSS
3. Instalar y configurar shadcn/ui
4. Configurar Supabase
5. Configurar React Query
6. Configurar testing (Vitest, Playwright)

**Comandos**:

```bash
npx create-next-app@latest finance-mvp --typescript --tailwind --app
cd finance-mvp
npx shadcn-ui@latest init
yarn add @supabase/supabase-js
yarn add @supabase/ssr
yarn add -D supabase
npx supabase init
yarn add @tanstack/react-query
yarn add zod axios
yarn add -D vitest @testing-library/react @testing-library/jest-dom
yarn add -D @playwright/test
```

**Agente**: `devops-engineer` (si se crea)

#### Día 3-4: Configurar Arquitectura Base

**Tareas**:

1. Crear estructura de carpetas
2. Configurar path aliases en tsconfig
3. Configurar ESLint y Prettier
4. Configurar Husky para pre-commit hooks
5. Crear base de .env con variables

**Estructura inicial**:

```
src/
├── app/
├── features/
├── components/
│   └── ui/
├── lib/
│   ├── utils.ts
│   └── axios.ts
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

**Agente**: `devops-engineer` + `hexagonal-backend-architect` (para estructura)

#### Día 5: Configurar CI/CD

**Tareas**:

1. Crear GitHub Actions workflows
2. Configurar tests automáticos
3. Configurar linting
4. Configurar deployment a Vercel

**Agente**: `devops-engineer`

---

## 📊 Métricas de Calidad

### Métricas por Feature

Para cada feature, validar:

1. **Code Coverage**:
   - Domain: 100%
   - Application: >95%
   - Infrastructure: >80%
   - Frontend: >85%

2. **Test Passing**:
   - All unit tests passing
   - All integration tests passing
   - All E2E tests passing

3. **Security**:
   - No critical vulnerabilities (npm audit)
   - OWASP Top 10 compliance
   - Proper input validation
   - Secure authentication

4. **Performance**:
   - Lighthouse score >90
   - API response time <200ms
   - Page load time <2s

5. **Accessibility**:
   - WCAG 2.1 AA compliance
   - Keyboard navigation
   - Screen reader support

6. **Code Quality**:
   - No ESLint errors
   - No TypeScript errors
   - Proper documentation
   - Code reviews passed

---

## 🎓 Best Practices

### 1. Spec-Driven Development

**Siempre empezar con specs**:

- Definir acceptance criteria antes de cualquier código
- Documentar decisiones de diseño
- Validar contra specs durante implementación

### 2. Test-Driven Development

**Red-Green-Refactor**:

1. Escribir test que falla
2. Escribir código mínimo para pasar test
3. Refactorizar código

### 3. Clean Architecture

**Dependency Rule**:

- Domain no depende de nada
- Application depende solo de Domain
- Infrastructure depende de Application
- Web depende de Infrastructure

### 4. Code Reviews

**Antes de mergear**:

- Todos los tests pasan
- Coverage alcanzado
- No security issues
- UX validated
- Documentation updated

### 5. Continuous Improvement

**Después de cada feature**:

- Retrospectiva
- Actualizar patterns
- Mejorar documentation
- Refinar agentes si es necesario

---

## 📝 Checklist de Finalización de Feature

- [ ] Acceptance criteria definidos
- [ ] Backend implementado
- [ ] Frontend implementado
- [ ] Tests unitarios al 100%
- [ ] Tests de integración pasando
- [ ] Tests E2E pasando
- [ ] Security audit pasado
- [ ] UX validated
- [ ] Documentation completa
- [ ] Code review aprobado
- [ ] PR merged

---

## 🚀 Conclusión

Este plan te proporciona:

1. **Agentes optimizados**: Usa tus agentes existentes de forma eficiente
2. **Comandos personalizados**: Automatiza workflows repetitivos
3. **Skills especializados**: Extiende capacidades para dominio financiero
4. **Workflow spec-driven**: Garantiza calidad desde el diseño
5. **Arquitectura sólida**: Hexagonal + DDD + TDD
6. **Calidad garantizada**: Multiple capas de validación

**Siguiente paso**: Crear los comandos personalizados y skills adicionales, luego comenzar con Feature 1 (Autenticación).

**Estimación total del MVP**: 7-8 sprints (14-16 semanas)
