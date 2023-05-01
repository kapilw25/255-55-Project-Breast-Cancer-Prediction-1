import React, { useEffect } from "react";
import { type RecipeData } from "./datatypes";
import { useDebounce } from "./useDebounce";
import InputForm from "./components/InputForm";

function Spinner(): JSX.Element {
  return (
    <div className="flex justify-center items-center mt-16">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );
}

function App(): JSX.Element {
  const [data, setData] = React.useState<RecipeData[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [model, setModel] = React.useState<string>("hybrid");
  const [recipeSearch, setRecipeSearch] = React.useState<string>("ice cream");
  const [suggestions, setSuggestions] = React.useState<Partial<RecipeData[]>>(
    []
  );
  const [recipeId, setRecipeId] = React.useState<number>(-1);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setLoading(true);
      console.log("Fetching data...");
      const response = await fetch(
        `http://127.0.0.1:5000/model/${model}?recipe_id=${recipeId}`
      );
      const data = await response.json();
      setData(data);
      setLoading(false);
    };
    console.log(recipeId, model);
    if (recipeId !== -1 && model.length > 0) {
      void fetchData();
    }
  }, [recipeId, model]);

  const search = async (): Promise<void> => {
    console.log("Searching...");
    const fetchSuggestions = async (): Promise<void> => {
      const response = await fetch(
        `http://127.0.0.1:5000/search?query=${recipeSearch}`
      );
      const data = await response.json();
      const names = data.map((recipe: RecipeData) => ({
        name: recipe.name,
        recipe_id: recipe.recipe_id,
      }));
      if (!(names.length <= 10 && names[0].name === recipeSearch)) {
        setSuggestions(names);
      }
    };
    if (recipeSearch.length > 0) {
      void fetchSuggestions();
    }
  };

  useDebounce(
    () => {
      void search();
    },
    [recipeSearch],
    500
  );

  const handleSuggestionClick = (suggestion: Partial<RecipeData>): void => {
    console.log("Suggestion clicked");
    setRecipeSearch((suggestion as RecipeData).name.toString());
    setRecipeId((suggestion as RecipeData).recipe_id);
    setSuggestions([]);
  };

  return (
    <div className="h-screen bg-gray-100">
      <div className="App bg-gray-100">
        <h1 className="text-2xl text-center p-8 uppercase text-red-400 font-bold">
          Breast Cancer Detection
        </h1>
        <InputForm />
      </div>
    </div>
  );
}

export default App;
