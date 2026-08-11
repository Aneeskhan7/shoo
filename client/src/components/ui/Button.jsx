import { Link } from 'react-router-dom';

/**
 * Variants read off the Figma frames:
 *  - primary   58px tall, green fill, black label (Add to Cart, Place Order)
 *  - secondary 54px tall, outlined (Shop →, Browse the Collection →)
 *  - circle    44×44 outlined arrow (hero ← →)
 */
const base =
  'inline-flex items-center justify-center font-medium transition-all duration-200 disabled:cursor-not-allowed';

const variants = {
  primary:
    'h-[58px] px-8 rounded-full bg-green text-black text-[16px] font-semibold hover:brightness-95 active:scale-[0.99] disabled:bg-grey-500 disabled:text-black/40',
  secondary:
    'h-[54px] px-8 rounded-full border border-current text-[16px] hover:bg-current/10 disabled:opacity-40',
  ghost: 'h-[44px] px-4 text-[15px] underline-offset-4 hover:underline disabled:opacity-40',
  circle:
    'w-[44px] h-[44px] rounded-full border border-current text-[16px] hover:opacity-70 disabled:opacity-30',
};

export default function Button({
  as,
  to,
  href,
  variant = 'primary',
  className = '',
  children,
  ...props
}) {
  const cls = `${base} ${variants[variant]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={cls} {...props}>
        {children}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={cls} {...props}>
        {children}
      </a>
    );
  }

  const Tag = as || 'button';
  return (
    <Tag className={cls} {...props}>
      {children}
    </Tag>
  );
}
