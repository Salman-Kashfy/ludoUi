import { Shapes } from "lucide-react"
import { Fragment, useState, useEffect } from "react"
import PageTitle from "../../components/PageTitle"
import { Box } from "@mui/material"

function Category() {

    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        console.log('categories', categories);
    }, [categories]);
    
    return (
        <Fragment>
            <PageTitle title="Category" titleIcon={<Shapes />} />
            <Box sx={{p:2}}>


            </Box>
        </Fragment>
    )
}

export default Category