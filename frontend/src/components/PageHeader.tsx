import React from 'react';

interface PageHeaderProps {
    title: React.ReactNode;
    children?: React.ReactNode;
    startAction?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, children, startAction }) => {
    return (
        <div className="page-header">
            <div className="page-header-content">
                <div className="d-flex align-items-center gap-3">
                    {startAction && <div className="page-header-start">{startAction}</div>}
                    <h4 className="page-header-title mb-0">{title}</h4>
                </div>
                {children && <div className="page-header-actions">{children}</div>}
            </div>
        </div>
    );
};

export default PageHeader;
