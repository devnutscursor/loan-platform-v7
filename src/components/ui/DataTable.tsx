import React from 'react';
import { theme, RoleType, colors, spacing, typography } from '@/theme/theme';
import { Button, ResendButton, DeactivateButton, DeleteButton } from './Button';

export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex?: string;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

export interface DataTableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  role?: RoleType;
  onResend?: (record: T) => void;
  onDeactivate?: (record: T) => void;
  onDelete?: (record: T) => void;
  className?: string;
}

/**
 * Centralized DataTable Component
 * 
 * Features:
 * - Reusable for both companies and loan officers
 * - Role-based action buttons
 * - Consistent styling and layout
 * - Loading states and empty states
 * - Customizable columns and actions
 */
export const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyMessage,
  role,
  onResend,
  onDeactivate,
  onDelete,
  className = '',
}: DataTableProps<T>) => {
  // Get role-based empty message
  const getEmptyMessage = () => {
    if (emptyMessage) return emptyMessage;
    if (role) return theme.roleTexts[role].emptyStateMessage;
    return 'No data found.';
  };

  // Render action buttons based on record status and role
  const renderActions = (record: T) => {
    const actions: React.ReactNode[] = [];

    // Determine record status based on common fields
    const inviteStatus = record?.invite_status || record?.status;
    const isActive = record?.isActive !== undefined ? record?.isActive : inviteStatus === 'accepted';

    // Resend button for pending/sent/expired invites
    if (onResend && (inviteStatus === 'sent' || inviteStatus === 'expired' || !isActive)) {
      actions.push(
        <ResendButton
          key="resend"
          role={role}
          onClick={() => onResend(record)}
          style={{ color: colors.blue[600], fontSize: typography.fontSize.xs }}
          onMouseEnter={(e) => e.currentTarget.style.color = colors.blue[900]}
          onMouseLeave={(e) => e.currentTarget.style.color = colors.blue[600]}
        />
      );
    }

    // Separator if we have more actions
    if (actions.length > 0 && (onDeactivate || onDelete)) {
      actions.push(<span key="separator" style={{ color: colors.gray[300] }}>|</span>);
    }

    // Deactivate button for active records
    if (onDeactivate && isActive) {
      actions.push(
        <DeactivateButton
          key="deactivate"
          role={role}
          onClick={() => onDeactivate(record)}
          style={{ color: colors.red[600], fontSize: typography.fontSize.xs }}
          onMouseEnter={(e) => e.currentTarget.style.color = colors.red[900]}
          onMouseLeave={(e) => e.currentTarget.style.color = colors.red[600]}
        />
      );
    }

    // Delete button for inactive/pending/expired records
    if (onDelete && (!isActive || inviteStatus === 'pending' || inviteStatus === 'expired')) {
      actions.push(
        <DeleteButton
          key="delete"
          role={role}
          onClick={() => onDelete(record)}
          style={{ color: colors.red[600], fontSize: typography.fontSize.xs }}
          onMouseEnter={(e) => e.currentTarget.style.color = colors.red[900]}
          onMouseLeave={(e) => e.currentTarget.style.color = colors.red[600]}
        />
      );
    }

    return actions.length > 0 ? (
      <div style={{ display: 'flex', gap: spacing.sm }}>
        {actions}
      </div>
    ) : null;
  };

  // Add actions column if any action handlers are provided
  const finalColumns: TableColumn<T>[] = [
    ...columns,
    ...(onResend || onDeactivate || onDelete ? [{
      key: 'actions',
      title: 'Actions',
      render: renderActions,
      width: '120px',
      align: 'left' as const,
    } as TableColumn<T>] : []),
  ];

  if (loading) {
    return (
      <div style={{ backgroundColor: colors.white, boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', borderRadius: '0.5rem' }} className={className}>
        <div style={{ padding: `${spacing.md} ${spacing.lg}` }}>
          <div style={{ textAlign: 'center', padding: spacing.xl }}>
            <div style={{ animation: 'spin 1s linear infinite', borderRadius: '50%', height: '2rem', width: '2rem', borderBottom: `2px solid ${colors.primary[600]}`, margin: '0 auto' }}></div>
            <p style={{ marginTop: spacing.sm, fontSize: typography.fontSize.sm, color: colors.text.muted }}>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div style={{ backgroundColor: colors.white, boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', borderRadius: '0.5rem' }} className={className}>
        <div style={{ padding: `${spacing.md} ${spacing.lg}` }}>
          <div style={{ textAlign: 'center', padding: spacing.xl, color: colors.text.muted }}>
            {getEmptyMessage()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: colors.white, boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', borderRadius: '0.5rem' }} className={className}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ minWidth: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead style={{ backgroundColor: colors.gray[50] }}>
            <tr>
              {finalColumns.map((column) => (
                <th
                  key={column.key}
                  style={{
                    padding: `${spacing.md} ${spacing.lg}`,
                    textAlign: column.align === 'center' ? 'center' : column.align === 'right' ? 'right' : 'left',
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.medium,
                    color: colors.text.muted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    width: column.width,
                    borderBottom: `1px solid ${colors.gray[200]}`,
                  }}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody style={{ backgroundColor: colors.white }}>
            {data.map((record, index) => (
              <tr 
                key={record.id || index} 
                style={{ 
                  borderBottom: `1px solid ${colors.gray[200]}`,
                  transition: 'background-color 0.15s ease-in-out',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.gray[50]}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.white}
              >
                {finalColumns.map((column) => {
                  const value = column.dataIndex ? record[column.dataIndex] : record[column.key];
                  
                  return (
                    <td
                      key={column.key}
                      style={{
                        padding: `${spacing.md} ${spacing.lg}`,
                        whiteSpace: 'nowrap',
                        fontSize: typography.fontSize.sm,
                        textAlign: column.align === 'center' ? 'center' : column.align === 'right' ? 'right' : 'left',
                        color: colors.text.primary,
                      }}
                    >
                      {column.render ? column.render(value, record, index) : value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Specialized components for common use cases
export const CompanyTable: React.FC<Omit<DataTableProps, 'role' | 'columns'>> = (props) => {
  const companyColumns: TableColumn[] = [
    {
      key: 'company',
      title: 'Company',
      render: (_, record) => (
        <div>
          <div style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.text.primary }}>{record.name}</div>
          <div style={{ fontSize: typography.fontSize.sm, color: colors.text.muted }}>{record.slug}</div>
          {record.isActive && (
            <div style={{ fontSize: typography.fontSize.xs, color: colors.green[600], fontWeight: typography.fontWeight.medium }}>🟢 Active Company</div>
          )}
        </div>
      ),
    },
    {
      key: 'email',
      title: 'Email',
      dataIndex: 'admin_email',
      render: (value, record) => value || record.email,
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'invite_status',
      render: (value, record) => {
        const status = value || 'pending';
        const expiresAt = record.invite_expires_at;
        
        return (
          <div>
            <span style={{
              display: 'inline-flex',
              padding: `${spacing.xs} ${spacing.sm}`,
              fontSize: typography.fontSize.xs,
              fontWeight: typography.fontWeight.semibold,
              borderRadius: '9999px',
              backgroundColor: status === 'accepted' ? colors.green[100] :
                              status === 'sent' ? colors.blue[100] :
                              status === 'expired' ? colors.red[100] :
                              colors.yellow[100],
              color: status === 'accepted' ? colors.green[800] :
                     status === 'sent' ? colors.blue[800] :
                     status === 'expired' ? colors.red[800] :
                     colors.yellow[800],
            }}>
              {status === 'accepted' ? '✅ Active' :
               status === 'sent' ? '📧 Invite Sent' :
               status === 'expired' ? '⏰ Expired' :
               '⏳ Pending'}
            </span>
            {status === 'sent' && expiresAt && (
              <div style={{ fontSize: typography.fontSize.xs, color: colors.text.muted, marginTop: spacing.xs }}>
                Expires: {new Date(expiresAt).toLocaleString()}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'created',
      title: 'Created',
      dataIndex: 'created_at',
      render: (value, record) => {
        const date = value || record.createdAt;
        return date ? new Date(date).toLocaleDateString() : 'N/A';
      },
    },
  ];

  return (
    <DataTable
      {...props}
      role="super_admin"
      columns={companyColumns}
    />
  );
};

export const OfficerTable: React.FC<Omit<DataTableProps, 'role' | 'columns'>> = (props) => {
  const officerColumns: TableColumn[] = [
    {
      key: 'officer',
      title: 'Officer',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ height: spacing.xl2, width: spacing.xl2, flexShrink: 0 }}>
            <div style={{ height: spacing.xl2, width: spacing.xl2, borderRadius: '50%', backgroundColor: colors.primary[100], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.primary[600] }}>
                {record.firstName?.charAt(0)}{record.lastName?.charAt(0)}
              </span>
            </div>
          </div>
          <div style={{ marginLeft: spacing.md }}>
            <div style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.text.primary }}>
              {record.firstName} {record.lastName}
            </div>
            {record.isActive && (
              <div style={{ fontSize: typography.fontSize.xs, color: colors.green[600], fontWeight: typography.fontWeight.medium }}>🟢 Active Officer</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      title: 'Email',
      dataIndex: 'email',
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'isActive',
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? '✅ Active' : '⏳ Inactive'}
        </span>
      ),
    },
    {
      key: 'joined',
      title: 'Joined',
      dataIndex: 'createdAt',
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  return (
    <DataTable
      {...props}
      role="company_admin"
      columns={officerColumns}
    />
  );
};