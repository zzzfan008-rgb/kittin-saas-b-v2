#!/bin/sh
# R-51 复验：对 main @ a624571 的隔离栈顺序跑四条 P1 的探针（必须串行：单设备会话）。
cd /tmp/gc-uiqa-r51/scripts
mkdir -p /tmp/gc-uiqa-r51/logs
node probe-p1-2-bg-gold.mjs > /tmp/gc-uiqa-r51/logs/probe-p1-2.log 2>&1
node analyze-p1-2-pixels.mjs > /tmp/gc-uiqa-r51/logs/analyze-p1-2.log 2>&1
node probe-p1-3-focus.mjs > /tmp/gc-uiqa-r51/logs/probe-p1-3.log 2>&1
node analyze-p1-3.mjs > /tmp/gc-uiqa-r51/logs/analyze-p1-3.log 2>&1
node probe-p1-3b-focus.mjs > /tmp/gc-uiqa-r51/logs/probe-p1-3b.log 2>&1
node dump-p1-3b.mjs > /tmp/gc-uiqa-r51/logs/dump-p1-3b.log 2>&1
node probe-p1-4-residue.mjs > /tmp/gc-uiqa-r51/logs/probe-p1-4.log 2>&1
echo DONE_ALL_R51
