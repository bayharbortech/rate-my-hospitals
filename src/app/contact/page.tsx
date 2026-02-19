import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
    return (
        <div className="container py-12 max-w-xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Contact Support</h1>
            <p className="text-muted-foreground mb-8">
                Have a question, suggestion, or need help? Fill out the form below and we'll get back to you as soon as possible.
            </p>

            <form className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Name</label>
                    <Input id="name" placeholder="Your name" />
                </div>

                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <Input id="email" type="email" placeholder="your@email.com" />
                </div>

                <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                    <Input id="subject" placeholder="How can we help?" />
                </div>

                <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">Message</label>
                    <Textarea id="message" placeholder="Tell us more..." className="min-h-[150px]" />
                </div>

                <Button className="w-full">Send Message</Button>
            </form>
        </div>
    );
}
