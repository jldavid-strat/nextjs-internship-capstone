import { db } from "@/lib/db/connect_db";
import {user} from "@/lib/db/schema"
async function createUser({ user }){
  try {
    await db.select(user)
  }
}
