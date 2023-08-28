"use server";

import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mogoose";
interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}
export async function createThread({
  text,
  author,
  communityId,
  path,
}: Params) {
  connectToDB();
  try {
    connectToDB();
    const createdThread = await Thread.create({
      text,
      author,
      community: null,
    });
    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });
  } catch (err: any) {
    throw new Error(`Error creating thread: ${err.message}`);
  }
}
export async function fetchThead({
  pageNumber = 1,
  pageSize = 20,
}: {
  pageNumber?: number;
  pageSize?: number;
}) {
  try {
    connectToDB();
    const skipAmout = (pageNumber - 1) * pageSize;
    const threads = await Thread.find({
      parentId: { $in: [null, undefined] },
    })
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      })
      .populate({
        path: "children", // Populate the children field
        populate: [
          {
            path: "author", // Populate the author field within children
            model: User,
            select: "_id id name parentId image", // Select only _id and username fields of the author
          },
          {
            path: "children", // Populate the children field within children
            model: Thread, // The model of the nested children (assuming it's the same "Thread" model)
            populate: {
              path: "author", // Populate the author field within nested children
              model: User,
              select: "_id id name parentId image", // Select only _id and username fields of the author
            },
          },
        ],
      })
      .skip(skipAmout)
      .limit(pageSize);

    const countThreads = await Thread.countDocuments({
      parentId: { $in: [null, undefined] },
    });
    const isNext = countThreads > threads.length + skipAmout;
    return { threads, isNext };
  } catch (err: any) {
    throw new Error(`Failed to fetch Thread ${err.message}`);
  }
}
export async function fetchThreadById(threadId: string) {
  try {
    connectToDB();
    const thread = await Thread.findById(threadId)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      })
      .populate({
        path: "children", // Populate the children field
        populate: [
          {
            path: "author", // Populate the author field within children
            model: User,
            select: "_id id name parentId image", // Select only _id and username fields of the author
          },
          {
            path: "children", // Populate the children field within children
            model: Thread, // The model of the nested children (assuming it's the same "Thread" model)
            populate: {
              path: "author", // Populate the author field within nested children
              model: User,
              select: "_id id name parentId image", // Select only _id and username fields of the author
            },
          },
        ],
      })
      .exec();

    return thread;
  } catch (err: any) {
    throw new Error(`Failed to fetch By Id ${err.message}`);
  }
}
interface addCommentProps {
  threadId: string;
  commentText: string;
  userId: string;
  path: string;
}
export async function addCommentToThread({
  commentText,
  path,
  threadId,
  userId,
}: addCommentProps) {
  connectToDB();
  try {
    const orginalThread = await Thread.findById(threadId);
    if (!orginalThread) {
      throw new Error("Thread not found");
    }
    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId,
    });
    const savedCommentThread = await commentThread.save();
    //Add the comment thread's ID
    orginalThread.children.push(savedCommentThread._id);
    await orginalThread.save();
    revalidatePath(path);
  } catch (err: any) {
    throw new Error(`Unable to add comment ${err.message}`);
  }
}
