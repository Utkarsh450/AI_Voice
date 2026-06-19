"use client";

interface Props {
  transcript: string;
}

export default function LiveTranscript({ transcript }: Props) {
  return (
    <div className="w-full max-w-3xl rounded-3xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xl">
      <p className="mb-3 text-sm font-medium text-slate-400">
        Latest Transcript
      </p>

      <p className="min-h-[40px] text-lg text-slate-100">
        {transcript || "Start speaking..."}
      </p>
    </div>
  );
  
  
  
}