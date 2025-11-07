import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { FormFieldConfig, FormSection } from '../../types/crud-config';
import { FormField } from './FormField';

/**
 * DynamicFormコンポーネントのProps
 */
interface DynamicFormProps {
        fields: FormFieldConfig[];
        sections?: FormSection[];
        initialValues?: Record<string, unknown>;
        validationSchema?: z.ZodType<Record<string, unknown>, z.ZodTypeDef, Record<string, unknown>>;
        onSubmit: (data: Record<string, unknown>) => void;
        isSubmitting?: boolean;
        submitText?: string;
        layout?: 'grid' | 'stack';
}

/**
 * 動的フォーム生成コンポーネント
 * shadcn/ui Card と Button を使用
 */
export const DynamicForm: React.FC<DynamicFormProps> = ({
        fields,
        sections,
        initialValues = {},
        validationSchema,
        onSubmit,
        isSubmitting = false, // isSubmitting を props から取得
        submitText = '保存',
        layout = 'grid'
}) => {
        const {
                control,
                handleSubmit,
                formState: { errors },
                reset,
        } = useForm<Record<string, unknown>>({
                resolver: validationSchema ? zodResolver(validationSchema) : undefined,
                defaultValues: initialValues,
        });

        // initialValuesが変更されたときにフォームをリセットする
        useEffect(() => {
                if (initialValues) {
                        reset(initialValues);
                }
        }, [initialValues, reset]);

        // セクション使用時のフィールドグループ化
        const groupedFields = React.useMemo(() => {
                if (!sections) {
                        return [{ title: '', fields }];
                }

                return sections.map(section => ({
                        ...section,
                        fields: fields.filter(field => section.fields.includes(field.key))
                }));
        }, [fields, sections]);

        return (
                <form onSubmit={handleSubmit((data) => onSubmit(data))} className="space-y-6">
                        {groupedFields.map((group, groupIndex) => (
                                <div key={groupIndex}>
                                        {group.title ? (
                                                <Card>
                                                        <CardHeader>
                                                                <CardTitle>{group.title}</CardTitle>
                                                                {group.description && (
                                                                        <CardDescription>{group.description}</CardDescription>
                                                                )}
                                                        </CardHeader>
                                                        <CardContent>
                                                                <div className={`
                  ${layout === 'grid'
                                                                                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                                                                                : 'space-y-4'
                                                                        }
                `}>
                                                                        {group.fields.map((field) => (
                                                                                <div
                                                                                        key={field.key}
                                                                                        className={layout === 'grid' && field.gridColumn ?
                                                                                                `col-span-${field.gridColumn}` :
                                                                                                undefined
                                                                                        }
                                                                                >
                                                                                        <Controller
                                                                                                name={field.key}
                                                                                                control={control}
                                                                                                render={({ field: controllerField }) => (
                                                                                                        <FormField
                                                                                                                config={field}
                                                                                                                value={controllerField.value}
                                                                                                                onChange={controllerField.onChange}
                                                                                                                onBlur={controllerField.onBlur}
                                                                                                                error={errors[field.key]?.message as string}
                                                                                                                disabled={isSubmitting || field.disabled} // isSubmitting を使用
                                                                                                        />
                                                                                                )}
                                                                                        />
                                                                                </div>
                                                                        ))}
                                                                </div>
                                                        </CardContent>
                                                </Card>
                                        ) : (
                                                <div className={`
              ${layout === 'grid'
                                                                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                                                                : 'space-y-4'
                                                        }
            `}>
                                                        {group.fields.map((field) => (
                                                                <div
                                                                        key={field.key}
                                                                        className={layout === 'grid' && field.gridColumn ?
                                                                                `col-span-${field.gridColumn}` :
                                                                                undefined
                                                                        }
                                                                >
                                                                        <Controller
                                                                                name={field.key}
                                                                                control={control}
                                                                                render={({ field: controllerField }) => (
                                                                                        <FormField
                                                                                                config={field}
                                                                                                value={controllerField.value}
                                                                                                onChange={controllerField.onChange}
                                                                                                onBlur={controllerField.onBlur}
                                                                                                error={errors[field.key]?.message as string}
                                                                                                disabled={isSubmitting || field.disabled} // isSubmitting を使用
                                                                                        />
                                                                                )}
                                                                        />
                                                                </div>
                                                        ))}
                                                </div>
                                        )}
                                </div>
                        ))}

                        {/* ボタンエリア */}
                        <div className="flex justify-end space-x-4 pt-6 border-t">
                                <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => reset()}
                                        disabled={isSubmitting} // isSubmitting を使用
                                >
                                        リセット
                                </Button>
                                <Button
                                        type="submit"
                                        disabled={isSubmitting} // isSubmitting を使用
                                >
                                        {isSubmitting ? '保存中...' : submitText}
                                </Button>
                        </div>
                </form>
        );
};