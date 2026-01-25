
export interface Umk {
  id: string;
  title: string;
  level?: string | null;
}

export interface Course {
  id: string;
  title: string;
  umk: Umk[];
}

export interface Publisher {
  id: string;
  name: string;
  courses: Course[];
}

export interface LibraryResponse {
  publishers: Publisher[];
}

export interface LibraryModule {
  id: string;
  title: string;
  order_index: number;
  module_code: string;
}

export interface LibraryUnit {
  id: string;
  title: string;
  order_index: number;
  unit_code: string;
  modules: LibraryModule[];
}

export interface LibraryLevel {
  id: string;
  level_code: string;
  title: string;
  order_index: number;
  units: LibraryUnit[];
}

export interface Course {
  id: string;
  key: string;
  title: string;
  levels: LibraryLevel[];
}

export interface Publisher {
  id: string;
  key: string;
  name: string;
  courses: Course[];
}
