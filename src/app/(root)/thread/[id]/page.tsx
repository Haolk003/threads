import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs";

import ThreadCard from "@/components/card/ThreadCard";

import { fetchUser } from "@/lib/actions/user.action";
import { fetchThreadById } from "@/lib/actions/thread.action";
import Comment from "@/components/forms/Comment";

async function Page({ params }: { params: { id: string } }) {
  if (!params.id) return null;
  const user = await currentUser();
  if (!user) return null;
  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboaring");
  const thread = await fetchThreadById(params.id);
  return (
    <section className="relative">
      <div>
        <ThreadCard
          author={thread.author}
          comments={thread.children}
          community={thread.community}
          content={thread.text}
          createdAt={thread.createdAt}
          currentUserId={user.id}
          id={thread._id}
          parentId={thread.parentId}
        />
        <div className="mt-7">
          <Comment
            threadId={params.id}
            currentUserId={JSON.stringify(userInfo._id)}
            currentUserImg={user.imageUrl}
          />
        </div>
        <div className=""></div>
      </div>
    </section>
  );
}
export default Page;
