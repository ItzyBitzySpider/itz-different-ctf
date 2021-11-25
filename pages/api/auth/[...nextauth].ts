import NextAuth from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import EmailProvider from 'next-auth/providers/email';
import { signIn } from 'next-auth/react';
import GithubProvider from 'next-auth/providers/github';
import { default as config } from "../../../server/config";

const prisma = new PrismaClient();

export default NextAuth({
	adapter: PrismaAdapter(prisma),
	providers: [
		EmailProvider({
			server: config['EMAIL_SERVER'],
			from: config['EMAIL_FROM'],
		}),
		GithubProvider({
			clientId: config['GITHUB_CLIENT_ID'],
			clientSecret: config['GITHUB_CLIENT_SECRET'],
		}),
	],
	pages: {
		signIn: 'login',
	},
	callbacks: {
		async signIn({ user, account, profile, email, credentials }) {
			let isAllowedToSignIn = false;
			// user = {"email":"actual_email_addr"}
			let userEmail = JSON.parse(JSON.stringify(user)).email;
			if (config['EMAIL_WHITELIST']) {
				//search for user email with prisma
				const emailWhitelisted = await prisma.email_whitelist.findUnique({
					where: {
						email: userEmail,
					},
				});
				if (emailWhitelisted) {
					isAllowedToSignIn = true;
				}
			} else {
				//email whitelist disabled, allow all users to register and login
				isAllowedToSignIn = true;
			}
			return isAllowedToSignIn;
		},
	},
});
