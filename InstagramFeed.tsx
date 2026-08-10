import { Instagram as IgIcon, Heart } from 'lucide-react';

const POSTS = [
  { img: 'https://images.pexels.com/photos/5275843/pexels-photo-5275843.jpeg?auto=compress&cs=tinysrgb&h=420&w=420', likes: '1.2k' },
  { img: 'https://images.pexels.com/photos/27816523/pexels-photo-27816523.jpeg?auto=compress&cs=tinysrgb&h=420&w=420', likes: '892' },
  { img: 'https://images.pexels.com/photos/4910563/pexels-photo-4910563.jpeg?auto=compress&cs=tinysrgb&h=420&w=420', likes: '2.1k' },
  { img: 'https://images.pexels.com/photos/1974656/pexels-photo-1974656.jpeg?auto=compress&cs=tinysrgb&h=420&w=420', likes: '1.5k' },
  { img: 'https://images.pexels.com/photos/32221017/pexels-photo-32221017.jpeg?auto=compress&cs=tinysrgb&h=420&w=420', likes: '3.4k' },
  { img: 'https://images.pexels.com/photos/5274654/pexels-photo-5274654.jpeg?auto=compress&cs=tinysrgb&h=420&w=420', likes: '978' },
];

export function InstagramFeed() {
  return (
    <section className="container-x mt-24">
      <div className="reveal text-center">
        <p className="section-eyebrow">Instagram</p>
        <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tighter2 text-ink-900 sm:text-5xl">
          @dipa.kids
        </h2>
        <p className="mx-auto mt-3 max-w-md text-ink-600">
          Partilha os momentos mais doces com a hashtag #vidadipa. Inspira-te e aparece aqui.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {POSTS.map((post, i) => (
          <a
            key={i}
            href="#"
            className="reveal group relative aspect-square overflow-hidden rounded-3xl"
            style={{ transitionDelay: `${i * 60}ms` }}
            aria-label="Ver no Instagram"
          >
            <img
              src={post.img}
              alt="Publicação Dipa no Instagram"
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-ink-900/0 opacity-0 transition-all duration-300 group-hover:bg-ink-900/45 group-hover:opacity-100">
              <span className="flex items-center gap-1.5 text-sm font-bold text-white">
                <Heart size={16} className="fill-white" /> {post.likes}
              </span>
            </div>
            <IgIcon
              size={20}
              className="absolute right-3 top-3 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
          </a>
        ))}
      </div>
    </section>
  );
}
