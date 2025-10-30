import { Fragment, useState, useEffect } from "react";
import { Box, Card, CardContent } from "@mui/material";
import PageTitle from "../../components/PageTitle";
import { Shapes } from "lucide-react";
import CategoryForm from "./CategoryForm";
import { GetCategory } from "../../services/category.service";
import {useParams} from "react-router-dom";
import ProgressBar from "../../components/ProgressBar";

function EditCategory() {

    const [formLoader, setFormLoader] = useState(true);
    const { uuid } = useParams();
    const [record, setRecord] = useState({});

    useEffect(() => {
        GetCategory(uuid).then((res) => {
            setRecord(res);
        }).finally(() => {
            setFormLoader(false);
        });
    }, [uuid]);

    return (
        <Fragment>
            <PageTitle title="Edit Category" titleIcon={<Shapes />} />
            <Card>
                <ProgressBar formLoader={formLoader}/>
                <CardContent>
                    <CategoryForm record={record} formLoader={formLoader}/>
                </CardContent>
            </Card>
        </Fragment>
    )
}

export default EditCategory;