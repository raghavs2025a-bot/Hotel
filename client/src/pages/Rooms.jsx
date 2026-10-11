import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, RotateCcw, SearchX } from 'lucide-react';
import RoomCard from '../components/RoomCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import { EmptyState, ErrorState, Loader } from '../components/feedback.jsx';
import useFetch from '../hooks/useFetch.js';
import useDebounce from '../hooks/useDebounce.js';
import { roomService } from '../services/index.js';
import { formatINR, nightsBetween } from '../utils/format.js';

const DEFAULT_FILTERS = { maxPrice: '', capacity: '', amenities: [], sort: 'recommended', onlyAvailable: false, text: '', location: '' };

const CITIES = ['Chennai', 'Mumbai', 'Bangalore', 'Delhi', 'Dubai', 'Bangkok', 'Singapore', 'Tokyo', 'Bali', 'Paris', 'New York', 'Sydney'];

export default function Rooms() {
  const [sp, setSp] = useSearchParams();
  const search = { checkIn: sp.get('checkIn') || '', checkOut: sp.get('checkOut') || '', guests: sp.get('guests') || '', category: sp.get('category') || '' };
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const meta = useFetch(() => roomService.meta(), []);
  const debounced = useDebounce(filters, 300);

  useEffect(() => {
    if (meta.data && filters.maxPrice === '') setFilters((f) => ({ ...f, maxPrice: String(meta.data.price.max_price) }));
  }, [meta.data]); // eslint-disable-line react-hooks/exhaustive-deps

  const params = useMemo(() => {
    const p = {};
    if (search.checkIn && search.checkOut) { p.checkIn = search.checkIn; p.checkOut = search.checkOut; }
    const guests = Math.max(Number(search.guests) || 0, Number(debounced.capacity) || 0);
    if (guests) p.guests = guests;
    if (search.category) p.category = search.category;
    if (debounced.location) p.location = debounced.location;
    if (debounced.maxPrice && meta.data && Number(debounced.maxPrice) < meta.data.price.max_price) p.maxPrice = debounced.maxPrice;
    if (debounced.amenities.length) p.amenities = debounced.amenities.join(',');
    if (debounced.text.trim()) p.search = debounced.text.trim();
    if (debounced.sort !== 'recommended') p.sort = debounced.sort;
    if (debounced.onlyAvailable) p.onlyAvailable = true;
    return p;
  }, [search.checkIn, search.checkOut, search.guests, search.category, debounced, meta.data]);

  const rooms = useFetch(() => roomService.list(params), [JSON.stringify(params)]);

  const setFilter = (k, v) => setFilters((f) => ({ ...f, [k]: v }));
  const toggleAmenity = (id) => setFilters((f) => ({ ...f, amenities: f.amenities.includes(id) ? f.amenities.filter((x) => x !== id) : [...f.amenities, id] }));
  const reset = () => { setFilters({ ...DEFAULT_FILTERS, maxPrice: meta.data ? String(meta.data.price.max_price) : '' }); setSp({}); };
  const onSearch = (form) => {
    const next = new URLSearchParams();
    Object.entries(form).forEach(([k, v]) => v && next.set(k, v));
    setSp(next);
  };

  const nights = nightsBetween(search.checkIn, search.checkOut);
  const m = meta.data;

  return (
    <>
      <section className="page-banner">
        <div className="container">
          <h1>Rooms &amp; Suites</h1>
          <p>Find the perfect room for your stay. Choose your dates to see live availability.</p>
          <SearchBar variant="inline" initial={search} onSearch={onSearch} />
        </div>
      </section>

      <div className="container rooms-layout">
        <button type="button" className="btn btn-outline filter-toggle" onClick={() => setShowFilters((s) => !s)} aria-expanded={showFilters}><Filter size={18} /> Filters &amp; sorting</button>
        <aside className={`filters ${showFilters ? 'open' : ''}`} aria-label="Room filters">
          <div className="filters-head"><h2>Filters</h2><button type="button" className="link-btn" onClick={reset}><RotateCcw size={14} /> Reset</button></div>

          <div className="field">
            <label htmlFor="f-location">City</label>
            <select id="f-location" value={filters.location} onChange={(e) => setFilter('location', e.target.value)}>
              <option value="">All cities</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="f-text">Search</label>
            <input id="f-text" type="search" placeholder="Name or keyword" value={filters.text} onChange={(e) => setFilter('text', e.target.value)} />
          </div>

          <div className="field">
            <label htmlFor="f-sort">Sort by</label>
            <select id="f-sort" value={filters.sort} onChange={(e) => setFilter('sort', e.target.value)}>
              <option value="recommended">Recommended</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
              <option value="capacity_desc">Capacity: high to low</option>
            </select>
          </div>

          {m && (
            <div className="field">
              <label htmlFor="f-price">Max price per night: <strong>{formatINR(filters.maxPrice || m.price.max_price)}</strong></label>
              <input id="f-price" type="range" min={Math.floor(m.price.min_price / 500) * 500} max={m.price.max_price} step="500" value={filters.maxPrice || m.price.max_price} onChange={(e) => setFilter('maxPrice', e.target.value)} />
              <div className="range-scale"><span>{formatINR(m.price.min_price)}</span><span>{formatINR(m.price.max_price)}</span></div>
            </div>
          )}

          <div className="field">
            <label htmlFor="f-cap">Minimum capacity</label>
            <select id="f-cap" value={filters.capacity} onChange={(e) => setFilter('capacity', e.target.value)}>
              <option value="">Any</option>
              {[2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}+ guests</option>)}
            </select>
          </div>

          <fieldset className="field">
            <legend>Amenities</legend>
            {m?.amenities.map((a) => (
              <label key={a.id} className="check"><input type="checkbox" checked={filters.amenities.includes(a.id)} onChange={() => toggleAmenity(a.id)} /> {a.name}</label>
            ))}
          </fieldset>

          <label className="check"><input type="checkbox" checked={filters.onlyAvailable} onChange={(e) => setFilter('onlyAvailable', e.target.checked)} /> Show available rooms only</label>
        </aside>

        <section aria-live="polite">
          <div className="results-head">
            <p>{rooms.data ? <><strong>{rooms.data.count}</strong> {rooms.data.count === 1 ? 'room' : 'rooms'} found</> : 'Searching...'}{nights > 0 && <> &middot; {nights} {nights === 1 ? 'night' : 'nights'}</>}</p>
          </div>
          {rooms.loading && <Loader label="Finding rooms..." />}
          {rooms.error && <ErrorState message={rooms.error} onRetry={rooms.reload} />}
          {!rooms.loading && rooms.data && rooms.data.rooms.length === 0 && (
            <EmptyState icon={SearchX} title="No rooms match your search" message="Try different dates, fewer filters or a higher price limit." action={<button type="button" className="btn btn-primary" onClick={reset}>Clear filters</button>} />
          )}
          {!rooms.loading && rooms.data && rooms.data.rooms.length > 0 && (
            <div className="room-list">{rooms.data.rooms.map((r) => <RoomCard key={r.id} room={r} search={search} />)}</div>
          )}
        </section>
      </div>
    </>
  );
}