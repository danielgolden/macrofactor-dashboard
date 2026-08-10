"use client";

import { useEffect, useRef, useState } from "react";
import { useChat, type UIMessage } from "@ai-sdk/react";
import { useUser } from "@clerk/nextjs";
import {
  ArrowUpIcon,
  BotIcon,
  Loader2Icon,
  RefreshCwIcon,
  SparklesIcon,
  StopCircleIcon,
  WrenchIcon,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ImportButton } from "./ImportButton";

const PLACEHOLDER =
  "What might be a nice substitute for some of my lowest calorie density foods?";

type LoadState = "loading" | "ready" | "error";

interface ToolPartInfo {
  type: string;
  toolName?: string;
  state?: string;
}

const markdownComponents = {
  table: (props: React.ComponentProps<"table">) => (
    <div className="my-2 w-full overflow-x-auto rounded-lg border">
      <Table {...props} />
    </div>
  ),
  thead: (props: React.ComponentProps<"thead">) => <TableHeader {...props} />,
  tbody: (props: React.ComponentProps<"tbody">) => <TableBody {...props} />,
  tr: (props: React.ComponentProps<"tr">) => <TableRow {...props} />,
  th: (props: React.ComponentProps<"th">) => (
    <TableHead className="font-bold" {...props} />
  ),
  td: (props: React.ComponentProps<"td">) => (
    <TableCell className="whitespace-normal" {...props} />
  ),
  a: ({ href, ...props }: React.ComponentProps<"a">) => {
    const safe =
      typeof href === "string" &&
      (href.startsWith("http://") || href.startsWith("https://"));
    if (!safe) return <span {...props} />;
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-primary underline underline-offset-2 hover:opacity-80"
        {...props}
      />
    );
  },
  code: (props: React.ComponentProps<"code">) => {
    const isBlock = (props.className ?? "").includes("language-");
    return isBlock ? (
      <code
        className="block overflow-x-auto rounded-md bg-background/60 p-3 text-xs font-mono"
        {...props}
      />
    ) : (
      <code
        className="rounded bg-background/60 px-1 py-0.5 text-xs font-mono"
        {...props}
      />
    );
  },
  pre: (props: React.ComponentProps<"pre">) => <pre {...props} />,
  ul: (props: React.ComponentProps<"ul">) => (
    <ul className="ml-4 list-disc space-y-1" {...props} />
  ),
  ol: (props: React.ComponentProps<"ol">) => (
    <ol className="ml-4 list-decimal space-y-1" {...props} />
  ),
  p: (props: React.ComponentProps<"p">) => (
    <p className="leading-relaxed" {...props} />
  ),
  h1: (props: React.ComponentProps<"h1">) => (
    <h1 className="text-base font-semibold" {...props} />
  ),
  h2: (props: React.ComponentProps<"h2">) => (
    <h2 className="text-sm font-semibold" {...props} />
  ),
  h3: (props: React.ComponentProps<"h3">) => (
    <h3 className="text-sm font-semibold" {...props} />
  ),
  blockquote: (props: React.ComponentProps<"blockquote">) => (
    <blockquote
      className="border-l-2 border-border pl-3 italic text-muted-foreground"
      {...props}
    />
  ),
  hr: (props: React.ComponentProps<"hr">) => (
    <hr className="border-border" {...props} />
  ),
};

export function ChatView() {
  const [history, setHistory] = useState<UIMessage[] | null>(null);
  const [hasData, setHasData] = useState(true);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/chat", { signal: controller.signal })
      .then((r) => r.json())
      .then((d: { messages?: UIMessage[]; hasData?: boolean; error?: string }) => {
        if (d.error) throw new Error(d.error);
        setHistory(d.messages ?? []);
        setHasData(d.hasData ?? false);
        setLoadState("ready");
      })
      .catch((e) => {
        if (e.name !== "AbortError") {
          setLoadError(e.message);
          setLoadState("error");
        }
      });
    return () => controller.abort();
  }, []);

  if (loadState === "loading") {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16">
        <p className="text-lg font-semibold text-destructive">
          Error loading chat
        </p>
        <p className="text-sm text-muted-foreground">{loadError}</p>
      </div>
    );
  }

  if (!hasData) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
          <SparklesIcon className="size-8 text-muted-foreground" />
          <h2 className="text-2xl font-semibold">Ask about your foods</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Import your MacroFactor Excel (.xlsx) or CSV file, then ask anything
            about your eating habits — the assistant can query your imported data.
          </p>
          <ImportButton onImported={() => setHasData(true)} />
        </CardContent>
      </Card>
    );
  }

  return <ChatInner initialMessages={history ?? []} />;
}

function ChatInner({ initialMessages }: { initialMessages: UIMessage[] }) {
  const { messages, sendMessage, status, stop, regenerate, error } = useChat({
    messages: initialMessages,
  });

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const isBusy = status === "submitted" || status === "streaming";

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  const submit = () => {
    const text = input.trim();
    if (!text || isBusy) return;
    sendMessage({ text });
    setInput("");
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100dvh-6rem)] w-full max-w-3xl flex-col gap-4">
      {/* Transcript */}
      {messages.length === 0 ? (
        <EmptyTranscript />
      ) : (
        <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
          {status === "submitted" && <ThinkingBubble />}
          {error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error.message}
            </div>
          )}
        </div>
      )}

      {/* Composer */}
      <div className="sticky bottom-0 bg-background pb-2 pt-1">
        <div className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={PLACEHOLDER}
            rows={2}
            className="resize-none pr-12"
            disabled={isBusy}
          />
          {isBusy ? (
            <Button
              size="icon-sm"
              variant="outline"
              className="absolute bottom-2 right-2"
              onClick={stop}
              aria-label="Stop"
            >
              <StopCircleIcon />
            </Button>
          ) : (
            <Button
              size="icon-sm"
              className="absolute bottom-2 right-2"
              onClick={submit}
              disabled={!input.trim()}
              aria-label="Send"
            >
              <ArrowUpIcon />
            </Button>
          )}
        </div>
        <div className="mt-1.5 flex items-center justify-between px-1 text-xs text-muted-foreground">
          <span>Enter to send · Shift+Enter for newline</span>
          {messages.length > 0 && !isBusy && (
            <Button
              size="xs"
              variant="ghost"
              onClick={() => regenerate()}
              className="gap-1"
            >
              <RefreshCwIcon /> Regenerate last
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyTranscript() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <SparklesIcon className="size-6 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold">Ask about your foods</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        The assistant can search your imported foods by macro category, calorie
        density zone, or date range. Try the example question in the box below.
      </p>
    </div>
  );
}

function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  const { user } = useUser();
  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";
  return (
    <div
      className={cn(
        "flex gap-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <Avatar size="sm" className="mt-0.5 shrink-0">
        <AvatarFallback>
          {isUser ? initials : <BotIcon className="size-3.5" />}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "flex max-w-[85%] flex-col gap-2",
          isUser ? "items-end" : "items-start"
        )}
      >
        {message.parts.map((part, i) => {
          if (part.type === "text") {
            return isUser ? (
              <div
                key={i}
                className="break-words rounded-2xl rounded-tr-sm bg-primary px-3.5 py-2 text-sm text-primary-foreground"
              >
                {part.text}
              </div>
            ) : (
              <div
                key={i}
                className="max-w-none space-y-3 rounded-2xl rounded-tl-sm bg-muted px-3.5 py-2.5 text-sm"
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {part.text}
                </ReactMarkdown>
              </div>
            );
          }
          if (
            part.type.startsWith("tool-") ||
            part.type === "dynamic-tool"
          ) {
            return <ToolChip key={i} part={part as ToolPartInfo} />;
          }
          return null;
        })}
      </div>
    </div>
  );
}

function ToolChip({ part }: { part: { toolName?: string; state?: string } }) {
  const done = part.state === "output-available";
  const errored = part.state === "output-error";
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground">
      <WrenchIcon className="size-3" />
      <span>
        {done ? "Queried " : errored ? "Failed to query " : "Querying "}
        <span className="font-medium">{part.toolName ?? "data"}</span>
      </span>
      {!done && !errored && <Loader2Icon className="size-3 animate-spin" />}
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div className="flex gap-3">
      <Avatar size="sm" className="mt-0.5 shrink-0">
        <AvatarFallback>
          <BotIcon className="size-3.5" />
        </AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-muted px-3.5 py-3">
        <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.3s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.15s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50" />
      </div>
    </div>
  );
}
