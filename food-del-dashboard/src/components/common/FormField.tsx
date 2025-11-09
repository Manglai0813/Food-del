import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { FormFieldConfig } from '../../types/crud-config';

// フォームフィールドのプロパティ定義
interface FormFieldProps {
    config: FormFieldConfig;
    value: unknown;
    onChange: (value: unknown) => void;
    onBlur: () => void;
    error?: string;
    disabled?: boolean;
}

// 動的フォームフィールドコンポーネント
export const FormField: React.FC<FormFieldProps> = ({
    config,
    value,
    onChange,
    onBlur,
    error,
    disabled
}) => {
    // フィールドタイプに応じたコンポーネントをレンダリング
    const renderField = () => {
        switch (config.type) {
            case 'text':
            case 'email':
            case 'url':
                return (
                    <Input
                        type={config.type}
                        value={(value as string | number | readonly string[] | undefined) || ''}
                        onChange={(e) => onChange(e.target.value)}
                        onBlur={onBlur}
                        placeholder={config.placeholder}
                        disabled={disabled}
                        className={error ? 'border-destructive' : ''}
                    />
                );

            case 'textarea':
                return (
                    <Textarea
                        value={(value as string | number | readonly string[] | undefined) || ''}
                        onChange={(e) => onChange(e.target.value)}
                        onBlur={onBlur}
                        placeholder={config.placeholder}
                        disabled={disabled}
                        rows={4}
                        className={error ? 'border-destructive' : ''}
                    />
                );

            case 'number':
            case 'currency':
                return (
                    <Input
                        type="number"
                        value={value === undefined || value === null ? '' : (value as string | number | readonly string[] | undefined)}
                        onChange={(e) => {
                            const numValue = e.target.value ? Number(e.target.value) : undefined;
                            onChange(numValue);
                        }}
                        onBlur={onBlur}
                        placeholder={config.placeholder}
                        disabled={disabled}
                        className={error ? 'border-destructive' : ''}
                    />
                );

            case 'select':
                return (
                    <Select
                        value={(value as string) || ''}
                        onValueChange={onChange}
                        disabled={disabled}
                    >
                        <SelectTrigger className={error ? 'border-destructive' : ''}>
                            <SelectValue placeholder="選択してください" />
                        </SelectTrigger>
                        <SelectContent>
                            {config.options?.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={String(option.value)}
                                    disabled={option.disabled}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );

            case 'boolean':
                return (
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id={config.key}
                            checked={(value as boolean) || false}
                            onCheckedChange={onChange}
                            disabled={disabled}
                        />
                        <Label
                            htmlFor={config.key}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            {config.label}
                        </Label>
                    </div>
                );

            case 'date':
                return (
                    <Input
                        type="date"
                        value={(value as string | number | readonly string[] | undefined) || ''}
                        onChange={(e) => onChange(e.target.value)}
                        onBlur={onBlur}
                        disabled={disabled}
                        className={error ? 'border-destructive' : ''}
                    />
                );

            case 'datetime':
                return (
                    <Input
                        type="datetime-local"
                        value={(value as string | number | readonly string[] | undefined) || ''}
                        onChange={(e) => onChange(e.target.value)}
                        onBlur={onBlur}
                        disabled={disabled}
                        className={error ? 'border-destructive' : ''}
                    />
                );

            case 'file':
            case 'image':
                return (
                    <Input
                        type="file"
                        onChange={(e) => onChange(e.target.files?.[0] || null)}
                        onBlur={onBlur}
                        accept={config.accept}
                        multiple={config.multiple}
                        disabled={disabled}
                        className={error ? 'border-destructive' : ''}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <div className="space-y-2">
            {config.type !== 'boolean' && (
                <Label className="text-sm font-medium">
                    {config.label}
                    {config.required && <span className="text-destructive ml-1">*</span>}
                </Label>
            )}

            {renderField()}

            {config.description && (
                <p className="text-sm text-muted-foreground">{config.description}</p>
            )}

            {error && (
                <div className="flex items-center text-sm text-destructive">
                    <AlertCircle size={16} className="mr-2" />
                    {error}
                </div>
            )}
        </div>
    );
};