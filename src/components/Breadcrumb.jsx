import React from 'react';
import Link from 'next/link';

const Breadcrumb = ({ paths, question }) => {
  return (
    <nav className="flex mb-4 text-sm" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link href="/" className="text-gray-400 hover:text-black">
            Home
          </Link>
        </li>
        {paths.map((path, index) => {
          const href = index === paths.length - 1 
            ? '#' 
            : `/${paths.slice(0, index + 1).join('/')}`;
          
          const displayPath = path === '[id]' && question 
            ? decodeHtml(question.title?.rendered) 
            : path.charAt(0).toUpperCase() + path.slice(1);
          
          return (
            <li key={index}>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                {index === paths.length - 1 ? (
                  <span className="text-black-500 italic">{displayPath}</span>
                ) : (
                  <Link href={href} className="text-gray-400 hover:text-black">
                    {displayPath}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
