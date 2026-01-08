// components/LoadingSpinner.tsx
import './LoadingSpinner.css';

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type SpinnerVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger';

interface LoadingSpinnerProps {
  /** Размер спиннера */
  size?: SpinnerSize;
  /** Вариант цвета */
  variant?: SpinnerVariant;
  /** Показать текст загрузки */
  withText?: boolean;
  /** Кастомный текст */
  text?: string;
  /** На весь экран */
  fullPage?: boolean;
  /** Инлайн спиннер (без блочного контейнера) */
  inline?: boolean;
}

const LoadingSpinner = ({
  size = 'md',
  variant = 'primary',
  withText = false,
  text = 'Loading...',
  fullPage = false,
  inline = false
}: LoadingSpinnerProps) => {
  const sizeClasses: Record<SpinnerSize, string> = {
    xs: 'spinner-xs',
    sm: 'spinner-sm',
    md: 'spinner-md',
    lg: 'spinner-lg',
    xl: 'spinner-xl'
  };

  const variantClasses: Record<SpinnerVariant, string> = {
    default: 'spinner-default',
    primary: 'spinner-primary',
    success: 'spinner-success',
    warning: 'spinner-warning',
    danger: 'spinner-danger'
  };

  const spinnerClass = `spinner ${sizeClasses[size]} ${variantClasses[variant]}`;
  
  if (inline) {
    return <div className={spinnerClass} />;
  }

  return (
    <div className={`loading-wrapper ${fullPage ? 'full-page' : ''}`}>
      <div className={spinnerClass} />
      {withText && <span className="loading-text">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;