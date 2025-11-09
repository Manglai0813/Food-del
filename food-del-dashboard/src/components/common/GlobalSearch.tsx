import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Propsの型定義
interface GlobalSearchProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

// グローバル検索コンポーネント
export const GlobalSearch: React.FC<GlobalSearchProps> = ({
    value,
    onChange,
    placeholder = "検索..."
}) => {
    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />

            <Input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="pl-10 pr-10"
            />

            {value && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onChange('')}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                >
                    <X size={16} />
                </Button>
            )}
        </div>
    );
};