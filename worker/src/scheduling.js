export function kahnOrder(subjects, prereqMap) {
  const indeg = {};
  const dependents = {};
  subjects.forEach((s) => {
    indeg[s.id] = (prereqMap[s.id] || []).length;
    dependents[s.id] = [];
  });
  subjects.forEach((s) => {
    (prereqMap[s.id] || []).forEach((p) => {
      if (!dependents[p]) dependents[p] = [];
      dependents[p].push(s.id);
    });
  });
  const byId = {};
  subjects.forEach((s) => (byId[s.id] = s));
  let queue = subjects.filter((s) => indeg[s.id] === 0).map((s) => s.id);
  const order = [];
  const indegCopy = { ...indeg };
  while (queue.length) {
    queue.sort((a, b) => {
      const sa = byId[a], sb = byId[b];
      if (sa.year_level !== sb.year_level) return sa.year_level - sb.year_level;
      return sa.sem - sb.sem;
    });
    const cur = queue.shift();
    order.push(cur);
    (dependents[cur] || []).forEach((d) => {
      indegCopy[d] -= 1;
      if (indegCopy[d] === 0) queue.push(d);
    });
  }
  return order;
}

function toMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function greedySchedule(subjectIds, sectionsBySubject) {
  const pairs = [];
  subjectIds.forEach((id) => {
    (sectionsBySubject[id] || []).forEach((sec) => {
      pairs.push({ subjectId: id, section: sec, endMin: toMinutes(sec.end_time) });
    });
  });
  pairs.sort((a, b) => a.endMin - b.endMin);
  const accepted = [];
  const scheduled = new Set();
  pairs.forEach((p) => {
    if (scheduled.has(p.subjectId)) return;
    const s = toMinutes(p.section.start_time);
    const e = toMinutes(p.section.end_time);
    const conflict = accepted.some((a) => {
      if (a.section.day !== p.section.day) return false;
      const as = toMinutes(a.section.start_time);
      const ae = toMinutes(a.section.end_time);
      return s < ae && as < e;
    });
    if (!conflict) {
      accepted.push(p);
      scheduled.add(p.subjectId);
    }
  });
  const unresolved = subjectIds.filter((id) => !scheduled.has(id));
  return { accepted, unresolved };
}

export function eligibleSubjects(subjects, prereqMap, completedIds) {
  const completed = new Set(completedIds);
  return subjects.filter((s) => {
    if (completed.has(s.id)) return false;
    const reqs = prereqMap[s.id] || [];
    return reqs.every((r) => completed.has(r));
  });
}
