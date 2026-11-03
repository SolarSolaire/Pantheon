function getWatchlistStorageKey() {
  const token = localStorage.getItem("pantheon_token");
  const payload = token?.split(".")[1];
  if (!payload) {
    throw new Error("Sign in to access your watchlist.");
  }

  let claims;
  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const bytes = Uint8Array.from(atob(paddedBase64), (character) =>
      character.charCodeAt(0)
    );
    claims = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new Error("Could not identify the signed-in user for this watchlist.");
  }

  const userId = claims.user_id;
  if (typeof userId !== "string" && typeof userId !== "number") {
    throw new Error("Could not identify the signed-in user for this watchlist.");
  }

  return `pantheon_watchlist_${userId}`;
}

function createDefaultList(movies = []) {
  return {
    version: 1,
    activeListId: "default",
    lists: [{ id: "default", name: "My Watchlist", movies }]
  };
}

function readUserWatchlists() {
  const storageKey = getWatchlistStorageKey();
  const storedWatchlists = localStorage.getItem(storageKey);
  if (!storedWatchlists) return createDefaultList();

  let data;
  try {
    data = JSON.parse(storedWatchlists);
  } catch {
    throw new Error("The saved watchlists are invalid. Clear them and try again.");
  }

  if (Array.isArray(data)) {
    const migratedData = createDefaultList(data);
    localStorage.setItem(storageKey, JSON.stringify(migratedData));
    return migratedData;
  }

  if (
    !data ||
    data.version !== 1 ||
    !Array.isArray(data.lists) ||
    data.lists.length === 0 ||
    typeof data.activeListId !== "string"
  ) {
    throw new Error("The saved watchlists are invalid. Clear them and try again.");
  }

  const ids = new Set();
  for (const list of data.lists) {
    if (
      !list ||
      typeof list.id !== "string" ||
      !list.id ||
      ids.has(list.id) ||
      typeof list.name !== "string" ||
      !list.name.trim() ||
      !Array.isArray(list.movies)
    ) {
      throw new Error("The saved watchlists are invalid. Clear them and try again.");
    }
    ids.add(list.id);
  }

  if (!ids.has(data.activeListId)) {
    throw new Error("The selected watchlist could not be found.");
  }

  return data;
}

function writeUserWatchlists(data) {
  localStorage.setItem(getWatchlistStorageKey(), JSON.stringify(data));
}

function getListName(name) {
  const trimmedName = name.trim();
  if (!trimmedName) throw new Error("Enter a name for the watchlist.");
  if (trimmedName.length > 40) {
    throw new Error("Watchlist names must be 40 characters or fewer.");
  }
  return trimmedName;
}

function ensureUniqueName(lists, name, exceptId) {
  const normalizedName = name.toLocaleLowerCase();
  if (
    lists.some(
      (list) =>
        list.id !== exceptId &&
        list.name.trim().toLocaleLowerCase() === normalizedName
    )
  ) {
    throw new Error("A watchlist with that name already exists.");
  }
}

export function loadUserWatchlists() {
  return readUserWatchlists();
}

export function setActiveUserWatchlist(listId) {
  const data = readUserWatchlists();
  if (!data.lists.some((list) => list.id === listId)) {
    throw new Error("The selected watchlist could not be found.");
  }
  const updatedData = { ...data, activeListId: listId };
  writeUserWatchlists(updatedData);
  return updatedData;
}

export function createUserWatchlist(name) {
  const data = readUserWatchlists();
  const trimmedName = getListName(name);
  ensureUniqueName(data.lists, trimmedName);
  const list = {
    id:
      globalThis.crypto?.randomUUID?.() ||
      `list-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: trimmedName,
    movies: []
  };
  const updatedData = {
    ...data,
    activeListId: list.id,
    lists: [...data.lists, list]
  };
  writeUserWatchlists(updatedData);
  return updatedData;
}

export function renameUserWatchlist(listId, name) {
  const data = readUserWatchlists();
  const list = data.lists.find((item) => item.id === listId);
  if (!list) throw new Error("The selected watchlist could not be found.");
  const trimmedName = getListName(name);
  ensureUniqueName(data.lists, trimmedName, listId);
  const updatedData = {
    ...data,
    lists: data.lists.map((item) =>
      item.id === listId ? { ...item, name: trimmedName } : item
    )
  };
  writeUserWatchlists(updatedData);
  return updatedData;
}

export function deleteUserWatchlist(listId) {
  const data = readUserWatchlists();
  if (!data.lists.some((list) => list.id === listId)) {
    throw new Error("The selected watchlist could not be found.");
  }

  let lists = data.lists.filter((list) => list.id !== listId);
  if (lists.length === 0) lists = createDefaultList().lists;
  const activeListId =
    data.activeListId === listId ? lists[0].id : data.activeListId;
  const updatedData = { ...data, activeListId, lists };
  writeUserWatchlists(updatedData);
  return updatedData;
}

export function loadUserWatchlist() {
  const data = readUserWatchlists();
  return data.lists.find((list) => list.id === data.activeListId).movies;
}

export function saveUserWatchlist(movies) {
  if (!Array.isArray(movies)) {
    throw new Error("Watchlist movies must be provided as an array.");
  }
  const data = readUserWatchlists();
  const updatedData = {
    ...data,
    lists: data.lists.map((list) =>
      list.id === data.activeListId ? { ...list, movies } : list
    )
  };
  writeUserWatchlists(updatedData);
}
