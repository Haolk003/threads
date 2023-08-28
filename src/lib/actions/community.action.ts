"use server";

import { FilterQuery, SortOrder } from "mongoose";

import Community from "../models/community.model";
import Thread from "../models/thread.model";
import User from "../models/user.model";

import { connectToDB } from "../mogoose";

export async function createCommunity() {}
export async function addMemberToCommunity() {}
export async function deleteCommunity() {}
export async function removeUserFromCommunity() {}
export async function updateCommunityInfo() {}
