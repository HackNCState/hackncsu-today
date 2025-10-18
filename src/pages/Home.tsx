export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">HackNCState Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening at the hackathon.
          </p>
        </header>

        {/* Main Dashboard Content */}
        <main className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card text-card-foreground rounded-lg border border-border p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Total Participants
              </h3>
              <p className="text-3xl font-bold">324</p>
            </div>
            <div className="bg-card text-card-foreground rounded-lg border border-border p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Projects Submitted
              </h3>
              <p className="text-3xl font-bold">87</p>
            </div>
            <div className="bg-card text-card-foreground rounded-lg border border-border p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Time Remaining
              </h3>
              <p className="text-3xl font-bold">12h 34m</p>
            </div>
          </div>

          {/* Announcements */}
          <div className="bg-card text-card-foreground rounded-lg border border-border p-6">
            <h2 className="text-2xl font-semibold mb-4">📢 Announcements</h2>
            <div className="space-y-3">
              <div className="border-l-4 border-primary pl-4 py-2">
                <p className="font-medium">Lunch is being served in the main hall</p>
                <p className="text-sm text-muted-foreground">Posted 23 minutes ago</p>
              </div>
              <div className="border-l-4 border-muted pl-4 py-2">
                <p className="font-medium">Workshop: Intro to ML at 2:00 PM in Room 204</p>
                <p className="text-sm text-muted-foreground">Posted 1 hour ago</p>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-card text-card-foreground rounded-lg border border-border p-6">
            <h2 className="text-2xl font-semibold mb-4">🗓️ Schedule</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>• 2:00 PM - ML Workshop (Room 204)</p>
              <p>• 4:00 PM - Mentor Office Hours (Main Hall)</p>
              <p>• 6:00 PM - Dinner Service</p>
              <p>• 8:00 AM Tomorrow - Project Submissions Due</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
