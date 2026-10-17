import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions }) => (
  <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:flex-wrap sm:items-end sm:justify-between gap-3">
    <div className="min-w-0">
      <h1 className="text-lg sm:text-xl font-bold text-slate-900 m-0 tracking-tight">{title}</h1>
      {subtitle && <p className="text-sm text-slate-500 m-0 mt-1">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
  </div>
);

export default PageHeader;