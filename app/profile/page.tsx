import { getSessionUser } from "@/lib/auth"
import { findUserById } from "@/lib/db"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
    const session = await getSessionUser()
    if(!session) {
        redirect('/login')
    }

    const userId = session.id
    const user = await findUserById(userId)

    const formatDate = (value: string) =>
        new Intl.DateTimeFormat('en-GB', {
          dateStyle: 'medium',
          timeStyle: 'short',
          timeZone: 'Asia/Bangkok',
        }).format(new Date(value));
      

    return(
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="max-w-5xl mx-auto py-6 px-10">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
                <div className="flex gap-x-2">
                    <p className="font-bold uppercase">name:</p>
                    <p>{user.name}</p>
                </div>
                <div className="flex gap-x-2">
                    <p className="font-bold uppercase">e-mail:</p>
                    <p>{user.email}</p>
                </div>
                <div className="flex gap-x-2">
                    <p className="font-bold uppercase">created At:</p>
                    <p>{formatDate(user.createdAt)}</p>
                </div>
                <div className="flex gap-x-2">
                    <p className="font-bold uppercase">updated At:</p>
                    <p>{formatDate(user.updatedAt)}</p>
                </div>
                </div>
            </div>
        </div>
    )
}