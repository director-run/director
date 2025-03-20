import reactLogo from "./assets/react.svg";
import "./App.css";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type Post = {
  id: number;
  title: string;
  body: string;
  userId: number;
};
function usePosts() {
  return useQuery({
    queryKey: ["posts"],
    queryFn: async (): Promise<Post[]> => {
      const response = await fetch("https://jsonplaceholder.typicode.com/posts");
      return await response.json();
    },
  });
}

export function App() {
  const queryClient = useQueryClient();
  const { status, data, error, isFetching } = usePosts();

  return (
    <main className="container">
      <h1>Welcome to Director</h1>

      <div className="row">
        <img src={reactLogo} className="logo react" alt="React logo" />
      </div>

      <div>
        <h2>Posts</h2>
        {status === "pending" && <p>Loading...</p>}
        {status === "error" && <p>Error: {error?.message}</p>}
        {status === "success" && (
          <>
            <div>{isFetching ? "Updating..." : ""}</div>
            <ul>{Array.isArray(data) && data.slice(0, 5).map((post: Post) => <li key={post.id}>{post.title}</li>)}</ul>
            <button onClick={() => queryClient.invalidateQueries({ queryKey: ["posts"] })}>Refresh Posts</button>
          </>
        )}
      </div>
    </main>
  );
}
