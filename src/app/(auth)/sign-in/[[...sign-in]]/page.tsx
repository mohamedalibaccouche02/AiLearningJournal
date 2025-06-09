'use client'
import * as Clerk from '@clerk/elements/common'
import * as SignIn from '@clerk/elements/sign-in'
import { Button } from 'src/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from 'src/components/ui/card'
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'
import { Icons } from 'src/components/ui/icons'
export default function SignInPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <img src="/aijournallogo.svg" alt="AI Learning Journal Logo" className="w-full" />
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md " >
            <SignIn.Root>
              <Clerk.Loading>
                {(isGlobalLoading) => (
                  <>
                    <SignIn.Step name="start">
                      <Card className="w-full">
                        <CardHeader className="text-center">
                          <CardTitle>Sign in to AI Learning Journal</CardTitle>
                          <CardDescription>
                            Welcome back! Please sign in to continue
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-y-4">
                          <div className="flex justify-center">
                            <Clerk.Connection name="google" asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                type="button"
                                disabled={isGlobalLoading}
                              >
                                <Clerk.Loading scope="provider:google">
                                  {(isLoading) =>
                                    isLoading ? (
                                      <Icons.spinner className="size-4 animate-spin" />
                                    ) : (
                                      <>
                                        <Icons.google className="mr-2 size-4" />
                                        Google
                                      </>
                                    )
                                  }
                                </Clerk.Loading>
                              </Button>
                            </Clerk.Connection>
                          </div>
                          <p className="flex items-center gap-x-3 text-sm text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
                            or
                          </p>
                          <Clerk.Field name="identifier" className="space-y-2">
                            <Clerk.Label asChild>
                              <Label>Username</Label>
                            </Clerk.Label>
                            <Clerk.Input type="text" required asChild>
                              <Input />
                            </Clerk.Input>
                            <Clerk.FieldError className="block text-sm text-destructive" />
                          </Clerk.Field>
                        </CardContent>
                        <CardFooter className="grid gap-4">
                          <SignIn.Action submit asChild>
                            <Button disabled={isGlobalLoading} className="w-full">
                              <Clerk.Loading>
                                {(isLoading) => {
                                  return isLoading ? (
                                    <Icons.spinner className="size-4 animate-spin" />
                                  ) : (
                                    'Continue'
                                  )
                                }}
                              </Clerk.Loading>
                            </Button>
                          </SignIn.Action>
                          <Button
                            variant="link"
                            size="sm"
                            asChild
                            onClick={() => {
                              window.location.href = '/sign-up'
                            }}
                          >
                            <Clerk.Link navigate="sign-up">
                              Don't have an account? Sign up
                            </Clerk.Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    </SignIn.Step>

                    <SignIn.Step name="choose-strategy">
                      <Card className="w-full">
                        <CardHeader className="text-center">
                          <CardTitle>Use another method</CardTitle>
                          <CardDescription>
                            Facing issues? You can use any of these methods to sign in.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-y-4">
                          <SignIn.SupportedStrategy name="email_code" asChild>
                            <Button
                              type="button"
                              variant="link"
                              disabled={isGlobalLoading}
                            >
                              Verification code
                            </Button>
                          </SignIn.SupportedStrategy>
                          <SignIn.SupportedStrategy name="password" asChild>
                            <Button
                              type="button"
                              variant="link"
                              disabled={isGlobalLoading}
                            >
                              Password
                            </Button>
                          </SignIn.SupportedStrategy>
                        </CardContent>
                        <CardFooter className="grid gap-4">
                          <SignIn.Action navigate="previous" asChild>
                            <Button disabled={isGlobalLoading} className="w-full">
                              <Clerk.Loading>
                                {(isLoading) => {
                                  return isLoading ? (
                                    <Icons.spinner className="size-4 animate-spin" />
                                  ) : (
                                    'Go back'
                                  )
                                }}
                              </Clerk.Loading>
                            </Button>
                          </SignIn.Action>
                        </CardFooter>
                      </Card>
                    </SignIn.Step>

                    <SignIn.Step name="verifications">
                      <SignIn.Strategy name="password">
                        <Card className="w-full">
                          <CardHeader className="text-center">
                            <CardTitle>Enter your password</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              Welcome back <SignIn.SafeIdentifier />
                            </p>
                          </CardHeader>
                          <CardContent className="grid gap-y-4">
                            <Clerk.Field name="password" className="space-y-2">
                              <Clerk.Label asChild>
                                <Label>Password</Label>
                              </Clerk.Label>
                              <Clerk.Input type="password" asChild>
                                <Input />
                              </Clerk.Input>
                              <Clerk.FieldError className="block text-sm text-destructive" />
                            </Clerk.Field>
                          </CardContent>
                          <CardFooter className="grid gap-4">
                            <SignIn.Action submit asChild>
                              <Button disabled={isGlobalLoading} className="w-full">
                                <Clerk.Loading>
                                  {(isLoading) => {
                                    return isLoading ? (
                                      <Icons.spinner className="size-4 animate-spin" />
                                    ) : (
                                      'Continue'
                                    )
                                  }}
                                </Clerk.Loading>
                              </Button>
                            </SignIn.Action>
                            <SignIn.Action navigate="choose-strategy" asChild>
                              <Button type="button" size="sm" variant="link">
                                Use another method
                              </Button>
                            </SignIn.Action>
                          </CardFooter>
                        </Card>
                      </SignIn.Strategy>

                      <SignIn.Strategy name="email_code">
                        <Card className="w-full">
                          <CardHeader className="text-center">
                            <CardTitle>Verify your account</CardTitle>
                            <CardDescription>
                              Enter the verification code sent to your registered email
                            </CardDescription>
                            <p className="text-sm text-muted-foreground">
                              Welcome back <SignIn.SafeIdentifier />
                            </p>
                          </CardHeader>
                          <CardContent className="grid gap-y-4">
                            <Clerk.Field name="code">
                              <Clerk.Label className="sr-only">Verification code</Clerk.Label>
                              <div className="grid gap-y-2 items-center justify-center">
                                <div className="flex justify-center text-center">
                                  <Clerk.Input
                                    type="otp"
                                    autoSubmit
                                    className="flex justify-center has-[:disabled]:opacity-50"
                                    render={({ value, status }) => {
                                      return (
                                        <div
                                          data-status={status}
                                          className="relative flex h-9 w-9 items-center justify-center border-y border-r border-input text-sm shadow-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md data-[status=selected]:ring-1 data-[status=selected]:ring-ring data-[status=cursor]:ring-1 data-[status=cursor]:ring-ring"
                                        >
                                          {value}
                                        </div>
                                      )
                                    }}
                                  />
                                </div>
                                <Clerk.FieldError className="block text-sm text-destructive text-center" />
                                <SignIn.Action
                                  asChild
                                  resend
                                  className="text-muted-foreground"
                                  fallback={({ resendableAfter }) => (
                                    <Button variant="link" size="sm" disabled>
                                      Didn't receive a code? Resend (
                                      <span className="tabular-nums">{resendableAfter}</span>)
                                    </Button>
                                  )}
                                >
                                  <Button variant="link" size="sm">
                                    Didn't receive a code? Resend
                                  </Button>
                                </SignIn.Action>
                              </div>
                            </Clerk.Field>
                          </CardContent>
                          <CardFooter className="grid gap-4">
                            <SignIn.Action submit asChild>
                              <Button disabled={isGlobalLoading} className="w-full">
                                <Clerk.Loading>
                                  {(isLoading) => {
                                    return isLoading ? (
                                      <Icons.spinner className="size-4 animate-spin" />
                                    ) : (
                                      'Continue'
                                    )
                                  }}
                                </Clerk.Loading>
                              </Button>
                            </SignIn.Action>
                            <SignIn.Action navigate="choose-strategy" asChild>
                              <Button size="sm" variant="link">
                                Use another method
                              </Button>
                            </SignIn.Action>
                          </CardFooter>
                        </Card>
                      </SignIn.Strategy>
                    </SignIn.Step>
                  </>
                )}
              </Clerk.Loading>
            </SignIn.Root>
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/aijournallogin.png"
          alt="Background Image"
          className="absolute inset-0 h-full  object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}