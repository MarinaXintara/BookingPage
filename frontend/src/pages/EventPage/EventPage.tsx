import SearchPage from './Search';

export default function EventPage() {
    return <div>
        <h1>Event Page</h1>
        <SearchPage />
        <button onClick={() => window.location.href = "/create-event"}>Publish Event
        </button>
    </div>
}