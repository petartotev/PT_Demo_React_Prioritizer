# PT_Demo_React_Prioritizer
PT_Demo_React_Prioritizer is a front end application to manage one's priorities.

# Contents
- [Prerequisites](#prerequisites)
- [Setup with CRA](#setup-with-cra)

## Prerequisites

In order to create a React app with the latest version of `Next.js`, especially when using `Turbopack` (newer dev server):

1. Go to https://nodejs.org
2. Download the latest LTS version (currently node-v22.14.0-x64.msi)
3. Run the installer
- `C:\Program Files\nodejs\`
- Custom setup
  - [] Node.js runtime
  - [✅] corepack manager
  - [✅] npm package manager
  - [✅] Online documentatiom shortcuts
  - [✅] Add to PATH
- Tools for Native Modules
  - [✅] Automatically install the necessary tools
4. Restart your terminal
5. Check the new versions:
```
node -v
  => v22.14.0
npm -v
  => 10.9.2
```


## Setup with CRA

1. Create a new `Create-React-App (CRA)` React project with TypeScript:

```
npx create-react-app priority-manager-cra --template typescript
```

⚠️ WARNING: The React team announced that `Create React App (CRA)` is being deprecated for new projects. While CRA will continue to work in maintenance mode, it will no longer be actively developed or recommended for new apps. 

💡 SUGGESTION: Instead, the React team encourages developers to migrate to modern frameworks like [Next](#setup-with-next).

2. Install dependencies:

```
cd priority-manager-cra
npm install react-bootstrap bootstrap @hello-pangea/dnd
```

- `react-bootstrap bootstrap` - for styling;
- `@hello-pangea/dnd` - a maintained fork of react-beautiful-dnd for the drag and drop functionality. It enables:
    - Reordering priorities at the same level
    - Moving a priority item between different levels
    - Nesting items as sub-prioriti

3. Create the following folder structure:

- `src`
    - `/components`
    - `/types`

4. Create the Type definition:

- `src/types/Priority.ts`

```
export interface Priority {
  id: string;
  content: string;
  children: Priority[];
}
```

5. Create the Components:

- `src/components/PriorityItem.tsx` - create;
- `src/App.tsx` - update with the main application code from the artifact;
- `src/App.css` - add the CSS styles.

6. Start the Development Server:

```
npm start
```
