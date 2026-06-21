from typing import Dict, Any, List
from database.prisma_client import db
from datetime import datetime, timedelta

class AnalyticsService:
    async def get_dashboard_stats(self) -> Dict[str, Any]:
        """Aggregate stats for the analytics dashboard"""
        try:
            # 1. Total Sessions
            total_sessions = await db.session.count()
            
            # 2. Total Messages
            total_messages = await db.message.count()
            
            # 3. Average Duration
            sessions = await db.session.find_many(where={"durationSeconds": {"not": None}})
            avg_duration = sum([s.durationSeconds or 0 for s in sessions]) / len(sessions) if sessions else 0
            
            # 4. Sessions by Persona
            # Prisma Python doesn't have a direct groupBy yet that works perfectly in all types,
            # so we'll aggregate manually for safety.
            all_sessions = await db.session.find_many()
            persona_counts = {}
            for s in all_sessions:
                p = s.persona or "default"
                persona_counts[p] = persona_counts.get(p, 0) + 1
                
            persona_data = [{"name": k, "value": v} for k, v in persona_counts.items()]
            
            # 5. Sessions over time (last 7 days)
            # Group sessions by date
            date_counts = {}
            for i in range(7):
                d = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
                date_counts[d] = 0
                
            for s in all_sessions:
                if s.startedAt:
                    d = s.startedAt.strftime('%Y-%m-%d')
                    if d in date_counts:
                        date_counts[d] += 1
                        
            # Format for Recharts (needs sorted order, oldest to newest)
            timeline_data = [{"date": k, "calls": v} for k, v in sorted(date_counts.items())]
            
            # 6. Recent Calls (Last 10)
            recent_sessions_db = await db.session.find_many(
                take=10,
                order={"id": "desc"}
            )
            
            recent_calls = []
            for s in recent_sessions_db:
                recent_calls.append({
                    "id": s.id,
                    "date": s.startedAt.strftime('%Y-%m-%d %H:%M') if s.startedAt else "Unknown",
                    "duration": s.durationSeconds or 0,
                    "persona": s.persona or "default",
                    "status": s.status
                })
            
            return {
                "total_sessions": total_sessions,
                "total_messages": total_messages,
                "avg_duration_seconds": round(avg_duration, 1),
                "personas": persona_data,
                "timeline": timeline_data,
                "recent_calls": recent_calls
            }
        except Exception as e:
            print(f"Analytics error: {e}")
            return {
                "total_sessions": 0,
                "total_messages": 0,
                "avg_duration_seconds": 0,
                "personas": [],
                "timeline": [],
                "recent_calls": []
            }

analytics_service = AnalyticsService()
