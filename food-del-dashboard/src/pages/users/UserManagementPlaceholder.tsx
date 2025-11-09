import { Users, Wrench } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// ユーザー管理プレースホルダーページ
const UserManagementPlaceholder = () => {
    return (
        <div className="space-y-4 md:space-y-6 p-4 md:p-6">
            <div>
                <h1 className="text-xl md:text-3xl font-bold">ユーザー管理</h1>
                <p className="text-sm md:text-base text-muted-foreground">ユーザー情報の管理と運用</p>
            </div>

            <Card className="border-amber-200 bg-amber-50">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Wrench className="h-6 w-6 text-amber-600" />
                        <div className="space-y-1">
                            <CardTitle className="text-amber-900">開発中の機能</CardTitle>
                            <CardDescription className="text-amber-700">
                                ユーザー管理機能は現在開発中です
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-white rounded-lg p-4 space-y-3">
                        <p className="text-sm font-medium text-gray-700">
                            このページでは以下の機能が利用可能になります：
                        </p>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-start gap-2">
                                <span className="text-amber-600 mt-1">•</span>
                                <span>ユーザー一覧の表示と検索</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-600 mt-1">•</span>
                                <span>ユーザー情報の編集</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-600 mt-1">•</span>
                                <span>ユーザーロールの管理（管理者/スタッフ/顧客）</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-600 mt-1">•</span>
                                <span>ユーザーアカウントの有効/無効切り替え</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-600 mt-1">•</span>
                                <span>ユーザー情報の一括管理</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <p className="text-sm text-blue-800">
                            <span className="font-medium">💡 ヒント：</span> 現在、ユーザー認証とプロフィール管理機能が利用可能です。
                            詳細は左側メニューの「ダッシュボード」からアクセスしてください。
                        </p>
                    </div>

                    <div className="pt-2">
                        <Button variant="outline" disabled className="w-full sm:w-auto">
                            <Users className="h-4 w-4 mr-2" />
                            ユーザー管理（準備中）
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base md:text-lg">開発予定</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-muted-foreground space-y-2">
                        <p>ユーザー管理機能は以下のタイムラインで実装予定です：</p>
                        <div className="mt-3 space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>基本的なユーザー一覧機能</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <span>ユーザー情報編集機能</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                <span>ロール管理機能</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default UserManagementPlaceholder;