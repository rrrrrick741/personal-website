"use client";

import { useState, useEffect, useCallback } from "react";
import type { VocabWord, EnglishStats } from "@/lib/english";

type Tab = "list" | "flashcard" | "quiz";

export default function EnglishPage() {
  const [tab, setTab] = useState<Tab>("list");
  const [words, setWords] = useState<VocabWord[]>([]);
  const [stats, setStats] = useState<EnglishStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Add word form
  const [showAdd, setShowAdd] = useState(false);
  const [newWord, setNewWord] = useState("");
  const [newDef, setNewDef] = useState("");
  const [newExample, setNewExample] = useState("");
  const [newTags, setNewTags] = useState("");

  // Flashcard
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [filterUnmastered, setFilterUnmastered] = useState(true);

  // Quiz
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<
    { word: VocabWord; options: string[]; correct: number }[]
  >([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizDone, setQuizDone] = useState(false);

  const fetchData = useCallback(async () => {
    const [wordsRes, statsRes] = await Promise.all([
      fetch("/api/english"),
      fetch("/api/english?action=stats"),
    ]);
    if (wordsRes.ok) setWords(await wordsRes.json());
    if (statsRes.ok) setStats(await statsRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ---- Vocabulary CRUD ----
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newWord || !newDef) return;
    const res = await fetch("/api/english", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        word: newWord.trim(),
        definition: newDef.trim(),
        example: newExample.trim(),
        tags: newTags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      }),
    });
    if (res.ok) {
      setNewWord("");
      setNewDef("");
      setNewExample("");
      setNewTags("");
      setShowAdd(false);
      fetchData();
    }
  }

  async function handleToggleMastered(id: string) {
    await fetch("/api/english", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchData();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/english?id=${id}`, { method: "DELETE" });
    fetchData();
  }

  // ---- Flashcard ----
  const reviewWords = filterUnmastered
    ? words.filter((w) => !w.mastered)
    : words;

  function nextCard() {
    setFlipped(false);
    setTimeout(() => {
      setCardIndex((i) => (i + 1) % Math.max(reviewWords.length, 1));
    }, 150);
  }

  function prevCard() {
    setFlipped(false);
    setTimeout(() => {
      setCardIndex(
        (i) => (i - 1 + reviewWords.length) % Math.max(reviewWords.length, 1)
      );
    }, 150);
  }

  // ---- Quiz ----
  function startQuiz() {
    const pool = words.filter((w) => w.definition).slice(0, 20);
    if (pool.length < 4) return;

    const questions = pool.map((w) => {
      const others = pool
        .filter((o) => o.id !== w.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      const options = [w, ...others].sort(() => Math.random() - 0.5);
      const correct = options.findIndex((o) => o.id === w.id);
      return {
        word: w,
        options: options.map((o) => o.definition),
        correct,
      };
    });

    setQuizQuestions(questions);
    setQuizIndex(0);
    setQuizScore(0);
    setQuizAnswer(null);
    setQuizDone(false);
    setQuizStarted(true);
  }

  function answerQuiz(idx: number) {
    if (quizAnswer !== null) return;
    setQuizAnswer(idx);
    if (idx === quizQuestions[quizIndex].correct) {
      setQuizScore((s) => s + 1);
    }
  }

  function nextQuiz() {
    if (quizIndex + 1 >= quizQuestions.length) {
      setQuizDone(true);
    } else {
      setQuizAnswer(null);
      setQuizIndex((i) => i + 1);
    }
  }

  // ---- Render ----
  const tabs: { key: Tab; label: string; desc: string }[] = [
    { key: "list", label: "单词本", desc: "管理你的词汇库" },
    { key: "flashcard", label: "闪卡复习", desc: "翻转卡片记忆单词" },
    { key: "quiz", label: "测验", desc: "选择正确释义" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[--color-text] mb-1">
          英语学习
        </h1>
        <p className="text-sm text-[--color-text-secondary]">
          词汇积累 · 闪卡记忆 · 测验自检
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard label="总词汇" value={loading ? "--" : stats?.totalWords ?? 0} />
        <StatCard
          label="已掌握"
          value={loading ? "--" : stats?.masteredWords ?? 0}
        />
        <StatCard label="今日新增" value={loading ? "--" : stats?.todayAdded ?? 0} />
        <StatCard
          label="今日复习"
          value={loading ? "--" : stats?.todayReviewed ?? 0}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[--color-border] mb-8">
        {tabs.map(({ key, label, desc }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm transition-colors border-b-2 -mb-[1px] text-left ${
              tab === key
                ? "border-[--color-text] text-[--color-text] font-medium"
                : "border-transparent text-[--color-text-secondary] hover:text-[--color-text]"
            }`}
          >
            {label}
            <span className="hidden md:inline text-[10px] text-[--color-text-tertiary] ml-1.5">
              {desc}
            </span>
          </button>
        ))}
      </div>

      {/* ===== TAB 1: 单词本 ===== */}
      {tab === "list" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-[--color-text-tertiary]">
              {words.length} 个单词 · {words.filter((w) => w.mastered).length} 已掌握
            </p>
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="px-4 py-1.5 text-xs rounded-full bg-[--color-text] text-white hover:bg-[--color-accent-hover] transition-colors"
            >
              + 添加单词
            </button>
          </div>

          {/* Add form */}
          {showAdd && (
            <form
              onSubmit={handleAdd}
              className="mb-6 p-5 border border-[--color-border] rounded-[--radius-lg] bg-white space-y-3"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-[--color-text-tertiary] mb-1">
                    单词 *
                  </label>
                  <input
                    type="text"
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    placeholder="e.g. ubiquitous"
                    required
                    className="w-full border border-[--color-border] rounded-[--radius-sm] px-3 py-2 text-sm bg-[--color-bg-tertiary] focus:outline-none focus:border-[--color-text] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[--color-text-tertiary] mb-1">
                    释义 *
                  </label>
                  <input
                    type="text"
                    value={newDef}
                    onChange={(e) => setNewDef(e.target.value)}
                    placeholder="中文释义"
                    required
                    className="w-full border border-[--color-border] rounded-[--radius-sm] px-3 py-2 text-sm bg-[--color-bg-tertiary] focus:outline-none focus:border-[--color-text] transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-[--color-text-tertiary] mb-1">
                  例句
                </label>
                <input
                  type="text"
                  value={newExample}
                  onChange={(e) => setNewExample(e.target.value)}
                  placeholder="An example sentence..."
                  className="w-full border border-[--color-border] rounded-[--radius-sm] px-3 py-2 text-sm bg-[--color-bg-tertiary] focus:outline-none focus:border-[--color-text] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[--color-text-tertiary] mb-1">
                  标签（逗号分隔）
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="形容词, 常用"
                  className="w-full border border-[--color-border] rounded-[--radius-sm] px-3 py-2 text-sm bg-[--color-bg-tertiary] focus:outline-none focus:border-[--color-text] transition-colors"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 text-xs rounded-full bg-[--color-text] text-white hover:bg-[--color-accent-hover] transition-colors"
                >
                  保存
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-2 text-xs rounded-full border border-[--color-border] text-[--color-text-secondary] hover:text-[--color-text] transition-colors"
                >
                  取消
                </button>
              </div>
            </form>
          )}

          {/* Word list */}
          {words.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm text-[--color-text-tertiary]">
                还没有单词，添加第一个开始学习吧
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {words.map((w) => (
                <div
                  key={w.id}
                  className={`flex items-start gap-4 p-4 rounded-[--radius-lg] border transition-colors ${
                    w.mastered
                      ? "border-[--color-border] bg-[--color-bg-tertiary]"
                      : "border-[--color-border] bg-white"
                  }`}
                >
                  <button
                    onClick={() => handleToggleMastered(w.id)}
                    className={`mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 transition-colors ${
                      w.mastered
                        ? "bg-[--color-text] border-[--color-text]"
                        : "border-[--color-border] hover:border-[--color-text]"
                    }`}
                  >
                    {w.mastered && (
                      <svg viewBox="0 0 12 12" className="w-3.5 h-3.5 text-white m-auto">
                        <path
                          d="M2.5 6l2.5 2.5 4.5-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-sm font-medium ${
                          w.mastered
                            ? "text-[--color-text-tertiary] line-through"
                            : "text-[--color-text]"
                        }`}
                      >
                        {w.word}
                      </span>
                      {w.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.5 rounded-full bg-[--color-bg-secondary] text-[--color-text-tertiary]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-[--color-text-secondary] mt-0.5">
                      {w.definition}
                    </p>
                    {w.example && (
                      <p className="text-xs text-[--color-text-tertiary] mt-0.5 italic line-clamp-1">
                        {w.example}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(w.id)}
                    className="text-[--color-text-tertiary] hover:text-red-500 transition-colors shrink-0"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== TAB 2: 闪卡复习 ===== */}
      {tab === "flashcard" && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center gap-2 text-xs text-[--color-text-secondary] cursor-pointer">
              <input
                type="checkbox"
                checked={filterUnmastered}
                onChange={(e) => {
                  setFilterUnmastered(e.target.checked);
                  setCardIndex(0);
                  setFlipped(false);
                }}
                className="w-3.5 h-3.5 rounded border-[--color-border] accent-[--color-text]"
              />
              仅显示未掌握 ({words.filter((w) => !w.mastered).length})
            </label>
            <span className="text-xs text-[--color-text-tertiary]">
              {reviewWords.length > 0
                ? `${cardIndex + 1} / ${reviewWords.length}`
                : "0 / 0"}
            </span>
          </div>

          {reviewWords.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm text-[--color-text-tertiary]">
                {words.length === 0 ? "还没有单词" : "全部已掌握！"}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {/* Flashcard */}
              <div
                onClick={() => setFlipped(!flipped)}
                className="w-full max-w-md h-64 cursor-pointer perspective-1000"
              >
                <div
                  className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${
                    flipped ? "[transform:rotateY(180deg)]" : ""
                  }`}
                >
                  {/* Front */}
                  <div className="absolute inset-0 border border-[--color-border] rounded-[--radius-xl] bg-white flex flex-col items-center justify-center p-6 [backface-visibility:hidden]">
                    <p className="text-[10px] text-[--color-text-tertiary] tracking-widest mb-4">
                      单词
                    </p>
                    <p className="text-3xl font-light text-[--color-text] tracking-wide">
                      {reviewWords[cardIndex]?.word}
                    </p>
                    {reviewWords[cardIndex]?.tags.length > 0 && (
                      <div className="flex gap-1 mt-4">
                        {reviewWords[cardIndex].tags.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-[--color-bg-secondary] text-[--color-text-tertiary]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-[10px] text-[--color-text-tertiary] mt-6">
                      点击翻转
                    </p>
                  </div>
                  {/* Back */}
                  <div className="absolute inset-0 border border-[--color-border] rounded-[--radius-xl] bg-[--color-bg-secondary] flex flex-col items-center justify-center p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <p className="text-[10px] text-[--color-text-tertiary] tracking-widest mb-4">
                      释义
                    </p>
                    <p className="text-xl font-medium text-[--color-text] text-center leading-relaxed">
                      {reviewWords[cardIndex]?.definition}
                    </p>
                    {reviewWords[cardIndex]?.example && (
                      <p className="text-xs text-[--color-text-secondary] mt-4 text-center italic leading-relaxed max-w-sm">
                        {reviewWords[cardIndex].example}
                      </p>
                    )}
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleMastered(reviewWords[cardIndex].id);
                        }}
                        className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                          reviewWords[cardIndex]?.mastered
                            ? "border-[--color-text] bg-[--color-text] text-white"
                            : "border-[--color-border] text-[--color-text-secondary] hover:border-[--color-text]"
                        }`}
                      >
                        {reviewWords[cardIndex]?.mastered ? "已掌握" : "标记掌握"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4 mt-6">
                <button
                  onClick={prevCard}
                  className="w-10 h-10 rounded-full border border-[--color-border] flex items-center justify-center text-[--color-text-secondary] hover:text-[--color-text] hover:border-[--color-text] transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <button
                  onClick={nextCard}
                  className="px-6 py-2 rounded-full bg-[--color-text] text-white text-sm hover:bg-[--color-accent-hover] transition-colors"
                >
                  下一个
                </button>
                <button
                  onClick={prevCard}
                  className="w-10 h-10 rounded-full border border-[--color-border] flex items-center justify-center text-[--color-text-secondary] hover:text-[--color-text] hover:border-[--color-text] transition-colors rotate-180"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== TAB 3: 测验 ===== */}
      {tab === "quiz" && (
        <div>
          {!quizStarted ? (
            <div className="text-center py-12">
              <p className="text-sm text-[--color-text-secondary] mb-2">
                根据英文单词选择正确的中文释义
              </p>
              <p className="text-xs text-[--color-text-tertiary] mb-6">
                需要至少 4 个单词才能开始
              </p>
              <button
                onClick={startQuiz}
                disabled={words.length < 4}
                className="px-6 py-2.5 rounded-full bg-[--color-text] text-white text-sm hover:bg-[--color-accent-hover] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {words.length < 4 ? "词汇不足" : "开始测验"}
              </button>
            </div>
          ) : quizDone ? (
            <div className="text-center py-12">
              <div className="text-5xl font-light text-[--color-text] mb-4">
                {quizScore} / {quizQuestions.length}
              </div>
              <p className="text-sm text-[--color-text-secondary] mb-6">
                {quizScore === quizQuestions.length
                  ? "全部正确！"
                  : quizScore / quizQuestions.length >= 0.7
                  ? "不错，继续加油！"
                  : "多复习一下闪卡吧"}
              </p>
              <button
                onClick={startQuiz}
                className="px-6 py-2.5 rounded-full bg-[--color-text] text-white text-sm hover:bg-[--color-accent-hover] transition-colors"
              >
                再来一轮
              </button>
            </div>
          ) : (
            <div>
              {/* Progress */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs text-[--color-text-tertiary]">
                  第 {quizIndex + 1} / {quizQuestions.length} 题
                </span>
                <span className="text-xs text-[--color-text-tertiary]">
                  得分: {quizScore}
                </span>
              </div>
              <div className="w-full h-1 bg-[--color-border] rounded-full mb-8 overflow-hidden">
                <div
                  className="h-full bg-[--color-text] rounded-full transition-all duration-300"
                  style={{
                    width: `${((quizIndex + 1) / quizQuestions.length) * 100}%`,
                  }}
                />
              </div>

              {/* Question */}
              <div className="max-w-lg mx-auto">
                <p className="text-xs text-[--color-text-tertiary] tracking-widest mb-3">
                  这个单词是什么意思？
                </p>
                <p className="text-3xl font-light text-[--color-text] mb-8 text-center">
                  {quizQuestions[quizIndex].word.word}
                </p>

                <div className="space-y-2.5">
                  {quizQuestions[quizIndex].options.map((opt, i) => {
                    let borderClass = "border-[--color-border]";
                    let bgClass = "bg-white hover:bg-[--color-bg-secondary]";
                    if (quizAnswer !== null) {
                      if (i === quizQuestions[quizIndex].correct) {
                        borderClass = "border-green-500";
                        bgClass = "bg-green-50";
                      } else if (i === quizAnswer) {
                        borderClass = "border-red-400";
                        bgClass = "bg-red-50";
                      } else {
                        bgClass = "bg-white";
                      }
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => answerQuiz(i)}
                        disabled={quizAnswer !== null}
                        className={`w-full text-left px-4 py-3 rounded-[--radius-md] border text-sm transition-colors ${borderClass} ${bgClass}`}
                      >
                        <span className="text-[--color-text-secondary] mr-2">
                          {String.fromCharCode(65 + i)}.
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {quizAnswer !== null && (
                  <button
                    onClick={nextQuiz}
                    className="w-full mt-5 py-2.5 rounded-full bg-[--color-text] text-white text-sm hover:bg-[--color-accent-hover] transition-colors"
                  >
                    {quizIndex + 1 >= quizQuestions.length ? "查看结果" : "下一题"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="bg-white rounded-[--radius-lg] border border-[--color-border] p-4 text-center">
      <div className="text-2xl font-semibold text-[--color-text] mb-1 tabular-nums">
        {value}
      </div>
      <div className="text-[10px] text-[--color-text-tertiary] tracking-wider">
        {label}
      </div>
    </div>
  );
}
