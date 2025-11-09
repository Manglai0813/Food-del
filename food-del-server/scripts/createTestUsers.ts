// テストユーザー作成スクリプト
import { prisma } from '../src/lib/prisma';
import { AuthService } from '../src/services/authService';

async function createTestUsers() {
    try {
        // 管理者ユーザー
        const adminEmail = 'admin2025@example.com';
        const adminPassword = 'admin@2025';
        const adminName = 'Admin User';

        // 既存ユーザーをチェック
        const existingAdmin = await prisma.user.findUnique({
            where: { email: adminEmail }
        });

        if (existingAdmin) {
            console.log(`管理者ユーザーは既に存在します: ${adminEmail}`);
        } else {
            const hashedAdminPassword = await AuthService.hashPassword(adminPassword);
            const admin = await prisma.user.create({
                data: {
                    name: adminName,
                    email: adminEmail,
                    password: hashedAdminPassword,
                    role: 'admin'
                }
            });
            console.log(`管理者ユーザーを作成しました: ${adminEmail} (ID: ${admin.id})`);
        }

        // 一般ユーザー
        const userEmail = 'jhon2025@example.com';
        const userPassword = 'jhon@2025';
        const userName = 'John User';

        const existingUser = await prisma.user.findUnique({
            where: { email: userEmail }
        });

        if (existingUser) {
            console.log(`一般ユーザーは既に存在します: ${userEmail}`);
        } else {
            const hashedUserPassword = await AuthService.hashPassword(userPassword);
            const user = await prisma.user.create({
                data: {
                    name: userName,
                    email: userEmail,
                    password: hashedUserPassword,
                    role: 'customer'
                }
            });
            console.log(`一般ユーザーを作成しました: ${userEmail} (ID: ${user.id})`);
        }

        console.log('\nテストユーザー作成完了');
        console.log('管理者:');
        console.log(`  メール: ${adminEmail}`);
        console.log(`  パスワード: ${adminPassword}`);
        console.log('\n一般ユーザー:');
        console.log(`  メール: ${userEmail}`);
        console.log(`  パスワード: ${userPassword}`);

    } catch (error) {
        console.error('エラーが発生しました:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

createTestUsers();


