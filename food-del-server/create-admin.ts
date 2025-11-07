// 管理者ユーザー作成スクリプト
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
	const hashedPassword = await bcrypt.hash('admin123', 10);

	const admin = await prisma.user.upsert({
		where: { email: 'admin@example.com' },
		update: {},
		create: {
			email: 'admin@example.com',
			name: 'Admin User',
			password: hashedPassword,
			role: 'admin',
			phone: '1234567890',
		},
	});

	console.log('Admin user created:', admin);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
