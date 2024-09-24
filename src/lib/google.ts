import dayjs from 'dayjs'
import { google } from 'googleapis'
import { prisma } from './prisma'

export async function getGoogleOAuthToken(userId: string) {
  const account = await prisma.account.findFirstOrThrow({
    where: {
      provider: 'google',
      user_id: userId,
    },
  })

  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  )

  auth.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token,
    expiry_date: account.expires_at ? account.expires_at * 1000 : null,
  })

  if (!account.expires_at) {
    return auth
  }

  const isTokenExpired = dayjs(account.expires_at * 1000).isBefore(new Date())

  if (isTokenExpired) {
    const { credentials } = await auth.refreshAccessToken()
    const {
      // eslint-disable-next-line camelcase
      access_token,
      // eslint-disable-next-line camelcase
      expiry_date,
      // eslint-disable-next-line camelcase
      id_token,
      // eslint-disable-next-line camelcase
      refresh_token,
      scope,
      // eslint-disable-next-line camelcase
      token_type,
    } = credentials

    await prisma.account.update({
      where: {
        id: account.id,
      },
      data: {
        // eslint-disable-next-line camelcase
        access_token,
        // eslint-disable-next-line camelcase
        expires_at: expiry_date ? Math.floor(expiry_date / 1000) : null,
        // eslint-disable-next-line camelcase
        id_token,
        // eslint-disable-next-line camelcase
        refresh_token,
        scope,
        // eslint-disable-next-line camelcase
        token_type,
      },
    })

    auth.setCredentials({
      // eslint-disable-next-line camelcase
      access_token,
      // eslint-disable-next-line camelcase
      refresh_token,
      // eslint-disable-next-line camelcase
      expiry_date,
    })
  }

  return auth
}
