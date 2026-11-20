import { Link } from 'react-router-dom'
import { useCategories } from '../../hooks/useCategories'

export default function CategoryStrip() {
  const { categories } = useCategories()

  return (
    <section id="categories" className="container-page mt-8 sm:mt-10">
      <div className="no-scrollbar flex items-start gap-3 overflow-x-auto pb-2 sm:justify-between sm:gap-2">
        {categories.map((category) => (
          <Link
            key={category.slug}
            to={`/shop?category=${category.slug}`}
            className="group flex w-20 shrink-0 flex-col items-center gap-2 sm:w-auto sm:flex-1"
          >
            <span className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-soft transition duration-250 group-hover:-translate-y-1 group-hover:border-brand-200 group-hover:shadow-lift sm:h-[88px] sm:w-[88px]">
              <img
                src={category.image}
                alt=""
                className="h-full w-full object-cover transition duration-250 group-hover:scale-110"
                loading="lazy"
              />
            </span>
            <span className="text-center text-[11px] font-semibold leading-tight text-ink/70 transition group-hover:text-brand-700 sm:text-xs">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
