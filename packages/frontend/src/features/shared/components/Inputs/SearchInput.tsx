import { useNavigate } from 'react-router-dom'
import { useState, KeyboardEvent } from 'react'
import { PATHS } from '@/constants/paths'
import { ReactComponent as SearchIcon } from '@/assets/svg/search.svg'

export default function SearchInput() {
    const [query, setQuery] = useState('')
    const navigate = useNavigate()

    const handleSearch = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            e.stopPropagation()
            navigate(`${PATHS.HOME}?q=${encodeURIComponent(query.trim())}`)
        }
    }

    const onClick = () => {
        navigate(`${PATHS.HOME}?q=${encodeURIComponent(query.trim())}`)
    }

    return (
        <div className="h-10 px-4 flex items-center gap-2 bg-[#3E3E3E] rounded-full text-white">
            <SearchIcon className="w-5 h-5 cursor-pointer" onClick={onClick} />
            <input
                className="flex-1 text-base font-medium bg-transparent placeholder:text-white/60 focus:outline-none"
                placeholder="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleSearch}
            />
        </div>
    )
}
