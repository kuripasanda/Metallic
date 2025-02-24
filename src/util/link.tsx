import { NavLink, NavLinkProps } from 'react-router-dom';

interface UtilLinkProps extends Omit<NavLinkProps, 'className'> {
  className?: string;
  activeClassName?: string;
}

export function UtilLink({
  className,
  activeClassName,
  to,
  ...rest
}: UtilLinkProps) {
  return (
    <NavLink
      className={({ isActive }) => {
        const linkClasses = [className];
        if (isActive) linkClasses.push(activeClassName);

        return linkClasses.join(' ');
      }}
      to={to}
      {...rest}
    />
  );
}