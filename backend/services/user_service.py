from database.prisma_client import db

async def delete_user_data(user_id: str) -> bool:
    """
    Completely deletes a user and all their associated data.
    Since we don't have Cascade delete enabled in the Prisma schema,
    we must delete dependent child records first.
    """
    try:
        # 1. Find all sessions for this user
        sessions = await db.session.find_many(
            where={"participantIdentity": user_id}
        )
        
        session_ids = [session.id for session in sessions]
        
        if session_ids:
            # 2. Delete all child records (Messages, Summaries, Recordings)
            for s_id in session_ids:
                await db.message.delete_many(where={"sessionId": s_id})
                
                # Summary is 1-to-1, try deleting it if it exists
                try:
                    await db.summary.delete(where={"sessionId": s_id})
                except Exception:
                    pass
                
                # Recording is 1-to-1, try deleting it if it exists
                try:
                    await db.recording.delete(where={"sessionId": s_id})
                except Exception:
                    pass

            # 3. Delete the Sessions
            for s_id in session_ids:
                await db.session.delete(where={"id": s_id})
                
        # 4. Delete the UserMemory (Global Context)
        try:
            await db.usermemory.delete(where={"userId": user_id})
        except Exception:
            pass
            
        print(f"Successfully deleted all data for user {user_id}")
        return True
    except Exception as e:
        print(f"Failed to delete user {user_id}: {e}")
        return False
