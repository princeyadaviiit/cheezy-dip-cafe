import nextConfig from "eslint-config-next";

const eslintConfig = [
  {
    ignores: [".next/**", "dist/**", "node_modules/**", "coverage/**"],
  },
  ...nextConfig,
];

export default eslintConfig;
