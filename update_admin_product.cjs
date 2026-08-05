const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// 1. Add state
code = code.replace(
  `const [price, setPrice] = useState('');`,
  `const [price, setPrice] = useState('');\n  const [originalPrice, setOriginalPrice] = useState('');`
);

// 2. Add reset in resetForm
code = code.replace(
  `setPrice('');`,
  `setPrice('');\n    setOriginalPrice('');`
);

// 3. Add to handleEditProduct
code = code.replace(
  `setPrice(product.price.toString());`,
  `setPrice(product.price.toString());\n    setOriginalPrice(product.originalPrice ? product.originalPrice.toString() : '');`
);

// 4. Add to Save (Add/Edit)
const saveTarget = `      price: Number(price),
      costPrice: Number(costPrice) || Math.round(Number(price) * 0.55),
      category,`;
const saveReplace = `      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      costPrice: Number(costPrice) || Math.round(Number(price) * 0.55),
      category,`;
code = code.replace(saveTarget, saveReplace);
code = code.replace(saveTarget, saveReplace); // Replace both for add and edit if needed... wait, handleAddProduct and handleSaveEdit

fs.writeFileSync('src/components/AdminPanel.tsx', code);
