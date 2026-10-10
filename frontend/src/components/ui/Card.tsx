import React from 'react';

interface CardProps {
  title: string;
  description?: string;
  onClick?: () => void;
  disabled?: boolean;
  comingSoon?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  title,
  description,
  onClick,
  disabled = false,
  comingSoon = false,
  icon,
  children,
}) => {
  const handleClick = () => {
    if (!disabled && onClick) onClick();
  };

  return (
    <div
      onClick={handleClick}
      className={`
        bg-white rounded-xl border border-gray-200 p-6
        ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-blue-300 hover:shadow-sm'}
        transition-all duration-150
      `}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-base font-semibold text-gray-800 m-0">{title}</h3>
            {description && (
              <p className="text-sm text-gray-500 m-0 mt-1">{description}</p>
            )}
          </div>
        </div>
        {comingSoon && (
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium whitespace-nowrap">
            Coming Soon
          </span>
        )}
      </div>
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
};

export default Card;