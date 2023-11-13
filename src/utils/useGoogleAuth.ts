import { Auth, User, UserCredential } from '@firebase/auth'
import { useAuthState, useSignInWithGoogle } from 'react-firebase-hooks/auth'

type GoogleAuthHook = {
  loading: boolean
  error: Error | undefined
  userId: string | undefined
} & (
  | {
      user: User | null
      type: 'currentUser'
      signInWithGoogle?: undefined
    }
  | {
      user: UserCredential | undefined
      type: 'signInWithGoogle'
      signInWithGoogle: () => void
    }
)

export const useGoogleAuth = (auth: Auth): GoogleAuthHook => {
  const [currentUser, currentUserLoading, currentUserError] = useAuthState(auth)
  const [signInWithGoogle, user, loading, error] = useSignInWithGoogle(auth)
  if (currentUser) {
    return {
      user: currentUser,
      loading: currentUserLoading,
      error: currentUserError,
      type: 'currentUser',
      userId: currentUser.uid,
    }
  }
  return {
    signInWithGoogle,
    user,
    loading: currentUserLoading || loading,
    error: currentUserError ?? error,
    type: 'signInWithGoogle',
    userId: user?.user.uid,
  }
}
