import React from 'react';
import { Tag } from 'lucide-react';

export default function CategoryBadge({ category }) {
  return (
    <span className="badge badge-category">
      <Tag size={12} />
      {category || 'General'}
    </span>
  );
}
