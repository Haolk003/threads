"use server";

import { connectToDB } from "../mogoose";
import User from "../models/user.model";
import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import { FilterQuery } from "mongoose";

interface Params {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}
export async function updateUser({
  userId,
  username,
  bio,
  image,
  name,
  path,
}: Params): Promise<void> {
  try {
    connectToDB();
    await User.findOneAndUpdate(
      { id: userId },
      { username: username.toLowerCase(), name, bio, image, onboarded: true },
      { upsert: true }
    );
    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (err: any) {
    throw new Error(`Failed to created/update user:${err.message}`);
  }
}
export async function fetchUser(userId: string) {
  try {
    connectToDB();
    return await User.findOne({ id: userId });
  } catch (err: any) {
    throw new Error(`Failed to fetch user:${err.message}`);
  }
}
export async function fetchUserPosts(userId: string) {
  try {
    connectToDB();
    const threads = await User.findOne({ id: userId }).populate({
      path: "threads",
      model: Thread,
    });
    return threads;
  } catch (err: any) {
    throw new Error(`Error fetching user threads:`, err);
  }
}
export async function fetchUsers({
  userId,
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
}: {
  userId: string;
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
}) {
  try {
    connectToDB();
    const skipAmout = (pageNumber - 1) * pageSize;
    const regex = new RegExp(searchString, "i");

    const query: FilterQuery<typeof User> = {
      id: { $ne: userId },
    };
    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    const userQuery = User.find(query)
      .sort("-createdAt")
      .skip(skipAmout)
      .limit(pageSize);

    const countDocuments = await User.countDocuments(query);

    const users = await userQuery.exec();

    const isNext = countDocuments > skipAmout * users.length;
    return { isNext, users };
  } catch (err: any) {
    throw new Error("Error fetch users:", err);
  }
}
export async function getActivity(userId: string) {
  try {
    connectToDB();

    const userThreds = await Thread.find({ author: userId });

    const childThead = userThreds.reduce((acc, userThread) => {
      return acc.concat(userThread.children);
    }, []);
    const replies = await Thread.find({
      _id: { $in: childThead },
      author: { $ne: userId },
    }).populate({ path: "author", model: User, select: "name image" });
    return replies;
  } catch (err: any) {
    throw new Error(`Error fetching replies:${err.message}`);
  }
}
