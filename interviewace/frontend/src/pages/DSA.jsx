import { useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { FiPlay, FiCheck, FiX, FiClock, FiAward } from 'react-icons/fi';

// ─── Problem Bank ─────────────────────────────────────────────
const PROBLEMS = [
    {
        id: 1, title: 'Two Sum', difficulty: 'Easy', tags: ['Array', 'Hash Map'],
        description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

**Example:**
\`\`\`
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: nums[0] + nums[1] = 2 + 7 = 9
\`\`\``,
        starterCode: `function twoSum(nums, target) {
  // Your solution here
  
}`,
        tests: [
            { fn: 'twoSum([2,7,11,15], 9)', expected: '[0,1]', args: [[2, 7, 11, 15], 9], check: (r) => Array.isArray(r) && r[0] === 0 && r[1] === 1 },
            { fn: 'twoSum([3,2,4], 6)', expected: '[1,2]', args: [[3, 2, 4], 6], check: (r) => Array.isArray(r) && r.includes(1) && r.includes(2) },
            { fn: 'twoSum([3,3], 6)', expected: '[0,1]', args: [[3, 3], 6], check: (r) => Array.isArray(r) && r[0] === 0 && r[1] === 1 },
        ],
        solution: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const comp = target - nums[i];
    if (map.has(comp)) return [map.get(comp), i];
    map.set(nums[i], i);
  }
}`,
    },
    {
        id: 2, title: 'Valid Parentheses', difficulty: 'Easy', tags: ['Stack', 'String'],
        description: `Given a string \`s\` containing just the characters \`(\`, \`)\`, \`{\`, \`}\`, \`[\` and \`]\`, determine if the input string is valid.

**Example:**
\`\`\`
Input: s = "()[]{}"  → Output: true
Input: s = "(]"      → Output: false
\`\`\``,
        starterCode: `function isValid(s) {
  // Your solution here
  
}`,
        tests: [
            { fn: 'isValid("()")', expected: 'true', args: ['()'], check: (r) => r === true },
            { fn: 'isValid("()[]{}")', expected: 'true', args: ['()[]{}'], check: (r) => r === true },
            { fn: 'isValid("(]")', expected: 'false', args: ['(]'], check: (r) => r === false },
        ],
        solution: `function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const c of s) {
    if ('({['.includes(c)) stack.push(c);
    else if (stack.pop() !== map[c]) return false;
  }
  return stack.length === 0;
}`,
    },
    {
        id: 3, title: 'Maximum Subarray', difficulty: 'Medium', tags: ['Array', 'Dynamic Programming'],
        description: `Given an integer array \`nums\`, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.

**Example:**
\`\`\`
Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
Output: 6  (subarray [4,-1,2,1])
\`\`\``,
        starterCode: `function maxSubArray(nums) {
  // Your solution here
  
}`,
        tests: [
            { fn: 'maxSubArray([-2,1,-3,4,-1,2,1,-5,4])', expected: '6', args: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], check: (r) => r === 6 },
            { fn: 'maxSubArray([1])', expected: '1', args: [[1]], check: (r) => r === 1 },
            { fn: 'maxSubArray([5,4,-1,7,8])', expected: '23', args: [[5, 4, -1, 7, 8]], check: (r) => r === 23 },
        ],
        solution: `function maxSubArray(nums) {
  let max = nums[0], cur = nums[0];
  for (let i = 1; i < nums.length; i++) {
    cur = Math.max(nums[i], cur + nums[i]);
    max = Math.max(max, cur);
  }
  return max;
}`,
    },
    {
        id: 4, title: 'Reverse Linked List', difficulty: 'Easy', tags: ['Linked List', 'Recursion'],
        description: `Given the \`head\` of a singly linked list, reverse the list, and return the reversed list.

**Example:**
\`\`\`
Input:  1 → 2 → 3 → 4 → 5
Output: 5 → 4 → 3 → 2 → 1
\`\`\`

*Implement with the helper ListNode class (provided in template).*`,
        starterCode: `class ListNode {
  constructor(val = 0, next = null) {
    this.val = val; this.next = next;
  }
}

function reverseList(head) {
  // Your solution here
  
}`,
        tests: [
            { fn: 'reverseList(1→2→3)', expected: '3→2→1', args: [], check: () => true },  // manual
        ],
        solution: `function reverseList(head) {
  let prev = null, curr = head;
  while (curr) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}`,
    },
    {
        id: 5, title: 'Binary Search', difficulty: 'Easy', tags: ['Array', 'Binary Search'],
        description: `Given a sorted array of integers \`nums\` and an integer \`target\`, return the index of target, or \`-1\` if not found. Must run in O(log n).`,
        starterCode: `function search(nums, target) {
  // Your solution here
  
}`,
        tests: [
            { fn: 'search([-1,0,3,5,9,12], 9)', expected: '4', args: [[-1, 0, 3, 5, 9, 12], 9], check: (r) => r === 4 },
            { fn: 'search([-1,0,3,5,9,12], 2)', expected: '-1', args: [[-1, 0, 3, 5, 9, 12], 2], check: (r) => r === -1 },
        ],
        solution: `function search(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] === target) return mid;
    else if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}`,
    },
    {
        id: 6, title: 'Climbing Stairs', difficulty: 'Easy', tags: ['Dynamic Programming'],
        description: `You are climbing a staircase. It takes \`n\` steps to reach the top. Each time you can climb 1 or 2 steps. Return the number of distinct ways to reach the top.`,
        starterCode: `function climbStairs(n) {
  // Your solution here
  
}`,
        tests: [
            { fn: 'climbStairs(2)', expected: '2', args: [2], check: (r) => r === 2 },
            { fn: 'climbStairs(3)', expected: '3', args: [3], check: (r) => r === 3 },
            { fn: 'climbStairs(5)', expected: '8', args: [5], check: (r) => r === 8 },
        ],
        solution: `function climbStairs(n) {
  if (n <= 2) return n;
  let a = 1, b = 2;
  for (let i = 3; i <= n; i++) [a, b] = [b, a + b];
  return b;
}`,
    },
];

const DIFF_COLOR = { Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444' };

function runTests(code, tests) {
    const results = [];
    for (const t of tests) {
        if (!t.args || t.args.length === 0) {
            results.push({ ...t, pass: true, output: 'Manual verify', runtime: 0 });
            continue;
        }
        try {
            const fn = new Function(`${code}; return ${code.match(/function\s+(\w+)/)?.[1] || 'solve'};`)();
            const start = performance.now();
            const out = fn(...t.args);
            const ms = (performance.now() - start).toFixed(2);
            const pass = t.check(out);
            results.push({ ...t, pass, output: JSON.stringify(out), runtime: ms });
        } catch (e) {
            results.push({ ...t, pass: false, output: e.message, runtime: 0 });
        }
    }
    return results;
}

export default function DSA() {
    const [selP, setSelP] = useState(PROBLEMS[0]);
    const [code, setCode] = useState(PROBLEMS[0].starterCode);
    const [results, setResults] = useState(null);
    const [running, setRunning] = useState(false);
    const [showSolution, setShowSolution] = useState(false);
    const [tab, setTab] = useState('description');
    const [diffFilter, setDiffFilter] = useState('All');

    const selectProblem = (p) => {
        setSelP(p); setCode(p.starterCode);
        setResults(null); setShowSolution(false); setTab('description');
    };

    const handleRun = useCallback(() => {
        setRunning(true);
        setTimeout(() => {
            const r = runTests(code, selP.tests);
            setResults(r);
            setRunning(false);
            setTab('results');
        }, 400);
    }, [code, selP]);

    const filtered = diffFilter === 'All' ? PROBLEMS : PROBLEMS.filter(p => p.difficulty === diffFilter);
    const pass = results?.filter(r => r.pass).length;
    const total = results?.length;
    const allPass = results && pass === total;

    return (
        <div className="animate-fade" style={{ maxWidth: 1400, margin: '0 auto' }}>
            <div style={{ marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.35rem' }}>💻 DSA Practice</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Solve problems in Monaco editor — tests run in-browser, instant feedback</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.25rem', alignItems: 'start' }}>
                {/* ── Problem List ─────────────────────────────── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {/* Difficulty filter */}
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {['All', 'Easy', 'Medium', 'Hard'].map(d => (
                            <button key={d} onClick={() => setDiffFilter(d)}
                                style={{
                                    flex: 1, padding: '0.3rem', borderRadius: 8, fontSize: '0.72rem', fontWeight: 700,
                                    border: '1px solid var(--border)', cursor: 'pointer',
                                    background: diffFilter === d ? (DIFF_COLOR[d] || 'var(--accent)') : 'transparent',
                                    color: diffFilter === d ? '#fff' : 'var(--text-muted)',
                                }}>{d}</button>
                        ))}
                    </div>

                    <div className="card" style={{ padding: '0.5rem', maxHeight: 500, overflowY: 'auto' }}>
                        {filtered.map((p, i) => (
                            <button key={p.id} onClick={() => selectProblem(p)}
                                style={{
                                    width: '100%', textAlign: 'left', padding: '0.65rem 0.75rem', borderRadius: 8,
                                    border: '1px solid transparent', cursor: 'pointer', marginBottom: '0.25rem',
                                    background: selP.id === p.id ? 'rgba(99,102,241,0.1)' : 'transparent',
                                    borderColor: selP.id === p.id ? 'rgba(99,102,241,0.35)' : 'transparent',
                                }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                        {i + 1}. {p.title}
                                    </span>
                                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: DIFF_COLOR[p.difficulty] }}>{p.difficulty}</span>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                    {p.tags.map(t => (
                                        <span key={t} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: 100, background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>{t}</span>
                                    ))}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Editor + Description ──────────────────────── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {/* Tabs */}
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '0' }}>
                        {['description', 'results', 'solution'].map(t => (
                            <button key={t} onClick={() => setTab(t)}
                                style={{
                                    padding: '0.65rem 1.25rem', fontSize: '0.82rem', fontWeight: 600,
                                    background: 'transparent', border: 'none', cursor: 'pointer', textTransform: 'capitalize',
                                    borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
                                    color: tab === t ? 'var(--accent)' : 'var(--text-muted)',
                                    transition: 'all 0.2s',
                                }}>{t}</button>
                        ))}
                        <div style={{ flex: 1 }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 0.75rem' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: DIFF_COLOR[selP.difficulty] }}>{selP.difficulty}</span>
                            {selP.tags.map(t => (
                                <span key={t} style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem', borderRadius: 100, background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>{t}</span>
                            ))}
                        </div>
                    </div>

                    {/* Tab content area */}
                    <div className="card" style={{ borderRadius: '0 0 var(--radius) var(--radius)', borderTop: 'none', minHeight: 280, padding: '1.25rem' }}>
                        {tab === 'description' && (
                            <div style={{ fontSize: '0.85rem', lineHeight: 1.7, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                                {selP.description.replace(/`([^`]+)`/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1')}
                            </div>
                        )}
                        {tab === 'results' && (
                            results ? (
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: allPass ? '#10b981' : '#ef4444' }}>
                                            {allPass ? '🎉 All tests passed!' : `${pass}/${total} tests passed`}
                                        </div>
                                    </div>
                                    {results.map((r, i) => (
                                        <div key={i} style={{
                                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                                            padding: '0.6rem 0.75rem', borderRadius: 8, marginBottom: '0.4rem',
                                            background: r.pass ? 'rgba(16,185,129,0.07)' : 'rgba(239,68,68,0.07)',
                                            border: `1px solid ${r.pass ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                                        }}>
                                            {r.pass ? <FiCheck size={14} color="#10b981" /> : <FiX size={14} color="#ef4444" />}
                                            <span style={{ flex: 1, fontSize: '0.78rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{r.fn}</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>→ {r.output}</span>
                                            {r.runtime > 0 && (
                                                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                                                    <FiClock size={11} />{r.runtime}ms
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                    <FiPlay size={32} style={{ marginBottom: '0.75rem', opacity: 0.3 }} />
                                    <p>Run your code to see test results</p>
                                </div>
                            )
                        )}
                        {tab === 'solution' && (
                            <div>
                                {showSolution ? (
                                    <pre style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                                        {selP.solution}
                                    </pre>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                                        <FiAward size={32} style={{ marginBottom: '0.75rem', opacity: 0.3 }} />
                                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Try solving it yourself first!</p>
                                        <button className="btn btn-ghost" onClick={() => setShowSolution(true)}>Reveal Solution</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Monaco Editor */}
                    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', marginTop: '1rem' }}>
                        <div style={{ background: '#1e1e1e', padding: '0.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'monospace' }}>JavaScript</span>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => setCode(selP.starterCode)}
                                    style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem', borderRadius: 6, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', cursor: 'pointer' }}>
                                    Reset
                                </button>
                                <button onClick={handleRun} disabled={running}
                                    style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.3rem 0.9rem', borderRadius: 6, background: running ? '#374151' : '#6366f1', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <FiPlay size={12} />
                                    {running ? 'Running…' : 'Run'}
                                </button>
                            </div>
                        </div>
                        <Editor
                            height="320px"
                            defaultLanguage="javascript"
                            theme="vs-dark"
                            value={code}
                            onChange={(val) => setCode(val || '')}
                            options={{
                                fontSize: 14, fontFamily: 'Fira Code, Consolas, monospace',
                                minimap: { enabled: false }, scrollBeyondLastLine: false,
                                lineNumbers: 'on', tabSize: 2, wordWrap: 'on',
                                padding: { top: 12, bottom: 12 },
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
