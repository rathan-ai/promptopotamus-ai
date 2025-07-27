# Component Architecture & Standards

This document outlines the standardized component patterns and architecture for the Promptopotamus application.

## 📁 Directory Structure

```
src/components/
├── features/           # Feature-based component organization
│   ├── auth/          # Authentication components
│   ├── payments/      # Payment & subscription components
│   ├── prompts/       # Smart prompts & marketplace
│   ├── profiles/      # User profiles & social features
│   ├── certificates/  # Certifications & quizzes
│   ├── layout/        # App layout components
│   └── shared/        # Reusable utility components
├── admin/             # Admin-specific components
├── guides/            # Educational guide components
└── ui/                # Base UI component library
```

## 🧩 Standardized UI Components

### Modal Components

All modals should use the standardized modal components from `@/components/ui/Modal`:

#### Base Modal
```tsx
import { Modal } from '@/components/ui/Modal';

<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Modal Title"
  description="Optional description"
  size="md" // sm | md | lg | xl | full
  closable={true}
>
  {/* Modal content */}
</Modal>
```

#### Form Modal
```tsx
import { FormModal } from '@/components/ui/Modal';

<FormModal
  isOpen={isOpen}
  onClose={onClose}
  onSubmit={handleSubmit}
  title="Form Title"
  submitText="Submit"
  loading={loading}
>
  {/* Form fields */}
</FormModal>
```

#### Confirmation Modal
```tsx
import { ConfirmModal } from '@/components/ui/Modal';

<ConfirmModal
  isOpen={isOpen}
  onClose={onClose}
  onConfirm={handleConfirm}
  title="Confirm Action"
  description="Are you sure you want to proceed?"
  variant="danger" // danger | warning | info
  loading={loading}
/>
```

### Input Components

Use standardized input components from `@/components/ui/Input`:

#### Basic Input
```tsx
import { Input } from '@/components/ui/Input';

<Input
  label="Email Address"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="Enter your email"
  error={error}
  success="Email verified!"
  required
/>
```

#### Password Input
```tsx
import { PasswordInput } from '@/components/ui/Input';

<PasswordInput
  label="Password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  showStrength={true}
  required
/>
```

#### Textarea
```tsx
import { Textarea } from '@/components/ui/Input';

<Textarea
  label="Description"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  rows={4}
  error={error}
/>
```

#### Select
```tsx
import { Select } from '@/components/ui/Input';

<Select
  label="Category"
  value={category}
  onChange={(e) => setCategory(e.target.value)}
  options={[
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' }
  ]}
  placeholder="Select an option"
/>
```

### Card Components

Use standardized card components from `@/components/ui/Card`:

#### Basic Card
```tsx
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';

<Card variant="default" hover={true}>
  <CardHeader title="Card Title" description="Card description" />
  <CardContent>
    {/* Card content */}
  </CardContent>
  <CardFooter justify="end">
    {/* Card actions */}
  </CardFooter>
</Card>
```

#### Stats Card
```tsx
import { StatsCard } from '@/components/ui/Card';

<StatsCard
  title="Total Users"
  value="1,234"
  change={{ value: 12, type: 'increase' }}
  icon={<UsersIcon />}
  description="Last 30 days"
/>
```

#### Feature Card
```tsx
import { FeatureCard } from '@/components/ui/Card';

<FeatureCard
  title="Pro Plan"
  description="Perfect for professionals"
  icon={<CrownIcon />}
  features={['Feature 1', 'Feature 2', 'Feature 3']}
  action={<Button>Get Started</Button>}
  popular={true}
/>
```

### Loading Components

Use standardized loading components from `@/components/ui/Loading`:

#### Loading Spinner
```tsx
import { LoadingSpinner } from '@/components/ui/Loading';

<LoadingSpinner size="md" />
```

#### Loading State Wrapper
```tsx
import { LoadingState } from '@/components/ui/Loading';

<LoadingState loading={loading} error={error}>
  {/* Content to show when loaded */}
</LoadingState>
```

#### Loading Button
```tsx
import { LoadingButton } from '@/components/ui/Loading';

<LoadingButton
  loading={isSubmitting}
  loadingText="Saving..."
  onClick={handleSave}
>
  Save Changes
</LoadingButton>
```

#### Loading Overlay
```tsx
import { LoadingOverlay } from '@/components/ui/Loading';

<LoadingOverlay loading={loading} message="Processing...">
  {/* Existing content */}
</LoadingOverlay>
```

## 🎨 Component Patterns

### 1. Props Interface Pattern
Always define TypeScript interfaces for component props:

```tsx
interface ComponentProps {
  title: string;
  description?: string;
  onAction: () => void;
  loading?: boolean;
  className?: string;
}

export default function Component({
  title,
  description,
  onAction,
  loading = false,
  className
}: ComponentProps) {
  // Component implementation
}
```

### 2. State Management Pattern
Use consistent state management patterns:

```tsx
const [data, setData] = useState<DataType | null>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string>('');

const handleAction = async () => {
  setLoading(true);
  setError('');
  
  try {
    const result = await someAsyncOperation();
    setData(result);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'An error occurred');
  } finally {
    setLoading(false);
  }
};
```

### 3. Service Integration Pattern
Use feature services for business logic:

```tsx
import { authService } from '@/features/auth/services/auth-service';
import { paymentService } from '@/features/payments/services/payment-service';

// Use services instead of direct API calls
const user = await authService.getCurrentUser();
const hasCredits = paymentService.hasPromptCoins(profile, 'analysis');
```

### 4. Error Handling Pattern
Consistent error handling across components:

```tsx
import { toast } from 'react-hot-toast';

try {
  await someOperation();
  toast.success('Operation completed successfully');
} catch (error) {
  const message = error instanceof Error ? error.message : 'Something went wrong';
  toast.error(message);
  console.error('Operation failed:', error);
}
```

### 5. Form Validation Pattern
Use standardized validation utilities:

```tsx
import { validateField, VALIDATION_PRESETS } from '@/lib/utils/validation';

const [errors, setErrors] = useState<Record<string, string>>({});

const validateForm = () => {
  const emailValidation = validateField(email, VALIDATION_PRESETS.email);
  const passwordValidation = validateField(password, VALIDATION_PRESETS.password);
  
  const newErrors: Record<string, string> = {};
  if (!emailValidation.isValid) newErrors.email = emailValidation.errors[0];
  if (!passwordValidation.isValid) newErrors.password = passwordValidation.errors[0];
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

## 🚀 Best Practices

### 1. Component Organization
- Keep components focused on a single responsibility
- Use feature-based organization for domain-specific components
- Place reusable components in `/ui` or `/shared`
- Create index files for easier imports

### 2. Naming Conventions
- Use PascalCase for component names
- Use camelCase for props and variables
- Use descriptive names that indicate purpose
- Prefix boolean props with `is`, `has`, `can`, or `should`

### 3. Performance
- Use `React.memo()` for expensive components
- Implement proper dependency arrays in `useEffect`
- Use `useCallback` and `useMemo` judiciously
- Lazy load components when appropriate

### 4. Accessibility
- Always include proper ARIA labels
- Ensure keyboard navigation works
- Use semantic HTML elements
- Test with screen readers

### 5. Styling
- Use Tailwind CSS utility classes
- Implement dark mode support
- Use the `cn()` utility for conditional classes
- Follow consistent spacing and sizing patterns

## 📋 Migration Guide

When refactoring existing components to use standardized patterns:

1. **Identify the component type** (Modal, Form, Card, etc.)
2. **Replace custom implementations** with standardized UI components
3. **Update imports** to use the new component structure
4. **Standardize props interfaces** and state management
5. **Test thoroughly** to ensure functionality is preserved
6. **Update documentation** and examples

## 🔧 Development Tools

### Custom Hooks
Use standardized hooks from `@/lib/utils/hooks`:

```tsx
import { useForm, useModal, useDebounce } from '@/lib/utils/hooks';

// Form management
const { values, errors, setValue, validateForm } = useForm(initialValues, validateSchema);

// Modal management  
const { isOpen, open, close } = useModal();

// Debounced values
const debouncedSearch = useDebounce(searchTerm, 300);
```

### Utility Functions
Use standardized utilities from `@/lib/utils`:

```tsx
import { formatCurrency, formatDate, truncateText } from '@/lib/utils/formatting';
import { isValidEmail, validatePromptContent } from '@/lib/utils/validation';

const formattedPrice = formatCurrency(price);
const validation = validatePromptContent(content);
```

This standardized approach ensures consistency, maintainability, and better developer experience across the entire application.