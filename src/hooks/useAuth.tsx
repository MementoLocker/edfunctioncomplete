// Create the Auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Define the shape of your profile data
interface Profile {
  id: string;
  name: string;
  email: string;
  subscription_status: string | null;
  stripe_customer_id: string | null;
  avatar_url?: string;
}

// Define the shape of the Auth context
interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

// Create the Auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
