import { ChangeEvent, Fragment, useCallback, useEffect, useState } from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@radix-ui/react-accordion";
import { ChevronRight } from "lucide-react";
import {
  CONFIG_BY_KEY,
  FilterKeyEnum,
} from "@/app/jobs-search/constants";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { trackEvent } from "@/lib/track";
import type { FilterKey } from "@/types/tracking";

type FilterBaseProps = {
  filterKey: FilterKeyEnum;
};
export default function FilterBase({ filterKey }: FilterBaseProps) {
  const [data, setData] = useState<{ name: string; id: string }[]>([]);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const getJobTypes = async () => {
      const response = await fetch(CONFIG_BY_KEY[filterKey].api).then((res) =>
        res.json(),
      );
      setData(response);
    };

    getJobTypes().then();
  }, [filterKey]);

  const createQueryString = useCallback(
    (name: string, value: string, shouldAdd = true) => {
      const currentValues = searchParams.get(name) || "";
      const currentValuesArr = currentValues
        .split("|")
        .filter((item) => !!item);
      let newValuesArr = [];
      if (shouldAdd) {
        newValuesArr = [...currentValuesArr, value];
      } else {
        newValuesArr = currentValuesArr.filter((item) => item !== value);
      }
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, newValuesArr.join("|"));
      return params.toString();
    },
    [searchParams],
  );

  const handleClick = useCallback(
    (name: string) => (event: ChangeEvent<HTMLInputElement>) => {
      const shouldAdd = event.target.checked;
      // L7 — job_filter_apply: mỗi lần tick/bỏ tick một giá trị lọc
      trackEvent("job_filter_apply", {
        page_type: "jobs_list",
        filter_key: CONFIG_BY_KEY[filterKey].key as FilterKey,
        filter_value: name,
        action: shouldAdd ? "add" : "remove",
      });
      const newQueryString = createQueryString(
        CONFIG_BY_KEY[filterKey].key,
        name,
        shouldAdd,
      );
      router.push(`${pathname}?${newQueryString}`);
    },
    [router, pathname, createQueryString, filterKey],
  );

  if (!data.length) {
    return <Fragment />;
  }

  return (
    <AccordionItem value={CONFIG_BY_KEY[filterKey].key}>
      <AccordionTrigger className="flex justify-between cursor-pointer text-light lg:text-[30px] text-[25px] mb-5 items-center w-full [&[data-state=open]>svg]:rotate-90">
        {CONFIG_BY_KEY[filterKey].title}
        <ChevronRight className="h-6 w-6 shrink-0 text-light transition-transform duration-200" />
      </AccordionTrigger>
      <AccordionContent className="pb-5 px-3">
        {data.map(({ name }) => {
          const checked = !!searchParams
            .get(CONFIG_BY_KEY[filterKey].key)
            ?.includes(name);

          return (
            <div
              key={name}
              className="flex items-center space-x-2 text-[18px] mb-3"
            >
              <input
                id={name}
                type="checkbox"
                className="h-[20px] w-[20px]"
                onChange={handleClick(name)}
                checked={checked}
              />
              <label htmlFor={name}>{name}</label>
            </div>
          );
        })}
      </AccordionContent>
    </AccordionItem>
  );
}
